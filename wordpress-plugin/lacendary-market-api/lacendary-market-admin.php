<?php
if (!defined('ABSPATH')) { exit; }

final class Lacendary_Market_Admin {
    const CRON_HOOK = 'lacendary_market_scheduler_tick';
    const OPT_ENABLED = 'lacendary_market_daily_enabled';
    const OPT_TIME = 'lacendary_market_daily_time';
    const OPT_NEXT = 'lacendary_market_next_run_at';

    public static function boot() {
        add_filter('cron_schedules', array(__CLASS__, 'cron_schedules'));
        add_action(self::CRON_HOOK, array(__CLASS__, 'scheduler_tick'));
        add_action('admin_menu', array(__CLASS__, 'admin_menu'));
        add_action('admin_post_lacendary_market_settings', array(__CLASS__, 'save_settings'));
        add_action('admin_post_lacendary_market_action', array(__CLASS__, 'admin_action'));
    }
    private static function table() { global $wpdb; return $wpdb->prefix . 'lk_market_refresh_runs'; }
    public static function activate() {
        global $wpdb; require_once ABSPATH . 'wp-admin/includes/upgrade.php'; $table=self::table(); $charset=$wpdb->get_charset_collate();
        dbDelta("CREATE TABLE $table (
            id bigint unsigned NOT NULL AUTO_INCREMENT, run_type varchar(32) NOT NULL, status varchar(40) NOT NULL,
            started_at datetime(6) NOT NULL, finished_at datetime(6) NOT NULL, elapsed_ms bigint unsigned NOT NULL DEFAULT 0,
            eligible_count int unsigned NOT NULL DEFAULT 0, attempted_count int unsigned NOT NULL DEFAULT 0,
            successful_count int unsigned NOT NULL DEFAULT 0, failed_count int unsigned NOT NULL DEFAULT 0, skipped_count int unsigned NOT NULL DEFAULT 0,
            retry_count int unsigned NOT NULL DEFAULT 0, kicksdb_request_count int unsigned NOT NULL DEFAULT 0, final_quota varchar(64) NULL,
            circuit_breaker_tripped tinyint(1) NOT NULL DEFAULT 0, circuit_breaker_reason text NULL,
            requested_product_id varchar(128) NULL, sneaker_database_id bigint unsigned NULL, summary_json longtext NOT NULL, created_at datetime NOT NULL,
            PRIMARY KEY (id), KEY started_at (started_at), KEY status_started (status,started_at), KEY type_started (run_type,started_at),
            KEY product_started (requested_product_id,started_at), KEY sneaker_started (sneaker_database_id,started_at)
        ) $charset;");
        if (!wp_next_scheduled(self::CRON_HOOK)) wp_schedule_event(time()+300, 'lacendary_five_minutes', self::CRON_HOOK);
        if (!get_option(self::OPT_TIME)) update_option(self::OPT_TIME, '03:00', false);
        self::recalculate_next_run();
    }
    public static function cron_schedules($s) { $s['lacendary_five_minutes']=array('interval'=>300,'display'=>'Every five minutes'); return $s; }
    public static function routes() {
        $auth=array('Lacendary_Market_API','authorize');
        register_rest_route(Lacendary_Market_API::NS,'/runs',array('methods'=>'POST','callback'=>array(__CLASS__,'save_run'),'permission_callback'=>$auth));
        register_rest_route(Lacendary_Market_API::NS,'/runs/latest',array('methods'=>'POST','callback'=>array(__CLASS__,'latest_run'),'permission_callback'=>$auth));
        register_rest_route(Lacendary_Market_API::NS,'/locks/acquire',array('methods'=>'POST','callback'=>array(__CLASS__,'acquire_lock'),'permission_callback'=>$auth));
        register_rest_route(Lacendary_Market_API::NS,'/locks/release',array('methods'=>'POST','callback'=>array(__CLASS__,'release_lock'),'permission_callback'=>$auth));
        register_rest_route(Lacendary_Market_API::NS,'/worker/nonce',array('methods'=>'POST','callback'=>array(__CLASS__,'claim_worker_nonce'),'permission_callback'=>$auth));
        register_rest_route(Lacendary_Market_API::NS,'/automation/settings',array('methods'=>'POST','callback'=>array(__CLASS__,'settings_api'),'permission_callback'=>$auth));
    }
    private static function valid_key($v) { return is_string($v) && preg_match('/^[A-Za-z0-9:_-]{1,160}$/',$v); }
    public static function acquire_lock($r) { $p=$r->get_json_params();$key=$p['key']??'';$ttl=min(900,max(60,intval($p['ttlSeconds']??360)));if(!self::valid_key($key))return new WP_Error('invalid_lock','Invalid lock key',array('status'=>400));$name='lk_market_lock_'.md5($key);$old=get_option($name);if(is_array($old)&&intval($old['expires'])>time())return new WP_Error('already_running','Refresh already running',array('status'=>409));delete_option($name);$ok=add_option($name,array('expires'=>time()+$ttl),'','no');return $ok?rest_ensure_response(array('acquired'=>true)):new WP_Error('already_running','Refresh already running',array('status'=>409)); }
    public static function release_lock($r) { $key=($r->get_json_params()['key']??'');if(!self::valid_key($key))return new WP_Error('invalid_lock','Invalid lock key',array('status'=>400));delete_option('lk_market_lock_'.md5($key));return rest_ensure_response(array('released'=>true)); }
    public static function claim_worker_nonce($r) { $id=$r->get_json_params()['requestId']??'';if(!preg_match('/^[a-f0-9-]{16,64}$/i',$id))return new WP_Error('invalid_nonce','Invalid request ID',array('status'=>400));$key='lk_worker_nonce_'.md5($id);if(get_transient($key))return new WP_Error('worker_replay','Worker request replayed',array('status'=>409));set_transient($key,1,600);return rest_ensure_response(array('ok'=>true)); }
    public static function save_run($r) { global $wpdb;$p=$r->get_json_params();$s=$p['summary']??array();$types=array('scheduled_full','manual_full','manual_single');$statuses=array('completed','completed_with_failures','upstream_unavailable','aborted_internal_error');if(!in_array($p['runType']??'',$types,true)||!in_array($s['status']??'',$statuses,true))return new WP_Error('invalid_run','Invalid run summary',array('status'=>400));$data=array('run_type'=>$p['runType'],'status'=>$s['status'],'started_at'=>self::dt($s['startedAt']),'finished_at'=>self::dt($s['finishedAt']),'elapsed_ms'=>intval($s['elapsedMs']??0),'eligible_count'=>intval($s['totalEligible']??0),'attempted_count'=>intval($s['attemptedRefreshes']??0),'successful_count'=>intval($s['successfulRefreshes']??0),'failed_count'=>intval($s['failedRefreshes']??0),'skipped_count'=>intval($s['skippedRefreshes']??0),'retry_count'=>intval($s['retriesUsed']??0),'kicksdb_request_count'=>intval($s['kicksDbRequests']??0),'final_quota'=>sanitize_text_field($s['quotaCurrent']??''),'circuit_breaker_tripped'=>empty($s['circuitBreakerTripped'])?0:1,'circuit_breaker_reason'=>sanitize_textarea_field($s['circuitBreakerReason']??''),'requested_product_id'=>sanitize_text_field($p['requestedProductId']??''),'sneaker_database_id'=>intval($p['sneakerDatabaseId']??0)?:null,'summary_json'=>wp_json_encode($s),'created_at'=>current_time('mysql',true));$wpdb->insert(self::table(),$data);if(!$wpdb->insert_id)return new WP_Error('run_write_failed','Could not store run',array('status'=>500));return rest_ensure_response(array('id'=>intval($wpdb->insert_id))); }
    private static function dt($v) { return gmdate('Y-m-d H:i:s',strtotime($v)); }
    public static function latest_run() { global $wpdb;$row=$wpdb->get_row('SELECT * FROM '.self::table()." WHERE run_type IN ('scheduled_full','manual_full') ORDER BY started_at DESC LIMIT 1",ARRAY_A);return rest_ensure_response($row?:null); }
    public static function settings_api() { return rest_ensure_response(array('enabled'=>(bool)get_option(self::OPT_ENABLED,false),'refreshTime'=>get_option(self::OPT_TIME,'03:00'),'timezone'=>wp_timezone_string(),'nextRunAt'=>get_option(self::OPT_NEXT)?:null)); }
    public static function next_run($time=null,$from=null) { $time=$time?:get_option(self::OPT_TIME,'03:00');$tz=wp_timezone();$now=$from instanceof DateTimeImmutable?$from:new DateTimeImmutable('now',$tz);list($h,$m)=array_map('intval',explode(':',$time));$candidate=$now->setTime($h,$m,0);if($candidate<=$now)$candidate=$candidate->modify('+1 day')->setTime($h,$m,0);return $candidate; }
    public static function recalculate_next_run() { $next=self::next_run();update_option(self::OPT_NEXT,$next->format(DateTimeInterface::ATOM),false);return $next; }
    public static function scheduler_tick() { if(!get_option(self::OPT_ENABLED,false))return;$next=get_option(self::OPT_NEXT);if(!$next){self::recalculate_next_run();return;}$due=new DateTimeImmutable($next);if(new DateTimeImmutable('now',wp_timezone())<$due)return;$result=self::invoke_worker(array('action'=>'full','runType'=>'scheduled_full'));if(is_wp_error($result)){update_option('lacendary_market_scheduler_error',$result->get_error_message(),false);update_option(self::OPT_NEXT,(new DateTimeImmutable('now',wp_timezone()))->modify('+15 minutes')->format(DateTimeInterface::ATOM),false);}else{delete_option('lacendary_market_scheduler_error');self::recalculate_next_run();} }
    private static function invoke_worker($payload) { if(!defined('LACENDARY_MARKET_WORKER_URL')||!LACENDARY_MARKET_WORKER_URL)return new WP_Error('worker_missing','Worker URL is not configured');$body=wp_json_encode($payload);$ts=(string)time();$id=wp_generate_uuid4();$path=wp_parse_url(LACENDARY_MARKET_WORKER_URL,PHP_URL_PATH);$canonical=implode("\n",array('POST',$path,$ts,$id,hash('sha256',$body)));$sig=hash_hmac('sha256',$canonical,Lacendary_Market_API::secret());if(function_exists('set_time_limit'))@set_time_limit(300);$res=wp_remote_post(LACENDARY_MARKET_WORKER_URL,array('timeout'=>300,'headers'=>array('Content-Type'=>'application/json','X-Lacendary-Timestamp'=>$ts,'X-Lacendary-Request-Id'=>$id,'X-Lacendary-Signature'=>$sig),'body'=>$body));if(is_wp_error($res))return $res;$code=wp_remote_retrieve_response_code($res);$decoded=json_decode(wp_remote_retrieve_body($res),true);return $code>=200&&$code<300?$decoded:new WP_Error('worker_failed','Worker returned HTTP '.$code); }
    public static function admin_menu() { add_menu_page('Lacendary Market','Lacendary Market','manage_options','lacendary-market',array(__CLASS__,'render_admin'),'dashicons-chart-line',58); }
    public static function save_settings() { if(!current_user_can('manage_options'))wp_die('Forbidden',403);check_admin_referer('lacendary_market_settings');$time=sanitize_text_field($_POST['refresh_time']??'');if(!preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/',$time))wp_die('Invalid time',400);update_option(self::OPT_ENABLED,!empty($_POST['enabled']),false);update_option(self::OPT_TIME,$time,false);self::recalculate_next_run();wp_safe_redirect(admin_url('admin.php?page=lacendary-market&updated=1'));exit; }
    public static function admin_action() {
        if(!current_user_can('manage_options'))wp_die('Forbidden',403);
        check_admin_referer('lacendary_market_action');
        $kind=sanitize_key($_POST['kind']??'');
        $id=absint($_POST['database_id']??0);
        $pid=sanitize_text_field($_POST['product_id']??'');
        $title=sanitize_text_field($_POST['title']??'');
        $sku=trim(sanitize_text_field($_POST['sku']??''));
        $sneaker=array('databaseId'=>$id,'title'=>$title,'slug'=>get_post_field('post_name',$id),'productId'=>$pid,'status'=>'active');
        if($kind==='full')$payload=array('action'=>'full','runType'=>'manual_full');
        elseif($kind==='single')$payload=array('action'=>'single','runType'=>'manual_single','sneaker'=>$sneaker);
        elseif($kind==='review')$payload=array('action'=>'mapping_review','databaseId'=>$id,'sku'=>$sku,'storedProductId'=>$pid);
        elseif($kind==='validate_override')$payload=array('action'=>'mapping_validate','databaseId'=>$id,'productId'=>sanitize_text_field($_POST['candidate_product_id']??''));
        elseif($kind==='apply_override'){
            if(empty($_POST['confirm_override']))wp_die('Explicit confirmation is required',400);
            $override=sanitize_text_field($_POST['candidate_product_id']??'');
            $reason=sanitize_textarea_field($_POST['reason']??'');
            if(!$override||!$reason)wp_die('Product ID and reason are required',400);
            $sneaker['productId']=$override;
            $payload=array('action'=>'mapping_override','databaseId'=>$id,'productId'=>$override,'reason'=>$reason,'hydrate'=>!empty($_POST['hydrate']),'sneaker'=>$sneaker);
        } else wp_die('Unknown market action',400);
        $result=self::invoke_worker($payload);
        set_transient('lk_market_admin_result_'.get_current_user_id(),array('kind'=>$kind,'databaseId'=>$id,'result'=>$result),300);
        wp_safe_redirect(admin_url('admin.php?page=lacendary-market'));exit;
    }
    public static function render_admin() {
        if(!current_user_can('manage_options'))return;
        $result=get_transient('lk_market_admin_result_'.get_current_user_id());delete_transient('lk_market_admin_result_'.get_current_user_id());
        global $wpdb;$last=$wpdb->get_row('SELECT * FROM '.self::table()." WHERE run_type IN ('scheduled_full','manual_full') ORDER BY started_at DESC LIMIT 1",ARRAY_A);
        echo '<div class="wrap"><h1>Lacendary Market</h1>';
        if($result)echo '<div class="notice notice-info"><p><strong>Market action result</strong></p><pre style="white-space:pre-wrap">'.esc_html(wp_json_encode($result['result'],JSON_PRETTY_PRINT)).'</pre></div>';
        echo '<h2>Market Automation</h2><form method="post" action="'.esc_url(admin_url('admin-post.php')).'"><input type="hidden" name="action" value="lacendary_market_settings">';wp_nonce_field('lacendary_market_settings');
        echo '<table class="form-table"><tr><th>Daily Refresh Enabled</th><td><input type="checkbox" name="enabled" value="1" '.checked(get_option(self::OPT_ENABLED,false),true,false).'></td></tr><tr><th>Daily Refresh Time</th><td><input type="time" name="refresh_time" value="'.esc_attr(get_option(self::OPT_TIME,'03:00')).'"></td></tr><tr><th>Time Zone</th><td>'.esc_html(wp_timezone_string()).'</td></tr><tr><th>Next Scheduled Run</th><td>'.esc_html(get_option(self::OPT_NEXT,'Not scheduled')).'</td></tr><tr><th>Last Full Refresh</th><td>'.esc_html($last['started_at']??'None').'</td></tr><tr><th>Last Status</th><td>'.esc_html($last['status']??'None').'</td></tr></table><p><button class="button button-primary">Save Settings</button></p></form>';
        self::action_form(array('kind'=>'full'),'Run Full Market Refresh Now','button button-secondary');
        echo '<h2>Market Mapping</h2><table class="widefat striped"><thead><tr><th>Sneaker</th><th>SKU</th><th>Product ID</th><th>Status</th><th>Last Sync</th><th>Mapping note</th><th>Controls</th></tr></thead><tbody>';
        foreach(get_posts(array('post_type'=>'sneaker','posts_per_page'=>-1,'post_status'=>'any')) as $post){
            if(!function_exists('get_field')||!get_field('market_tracking_enabled',$post->ID))continue;
            $sku=(string)get_field('sku',$post->ID);$pid=(string)get_field('kicksdb_product_id',$post->ID);$status=get_field('market_tracking_status',$post->ID);$sync=(string)get_field('market_last_successful_sync',$post->ID);$note=(string)get_field('market_notes',$post->ID);
            if(is_array($status))$status=implode(', ',$status);
            $base=array('database_id'=>$post->ID,'product_id'=>$pid,'title'=>$post->post_title,'sku'=>$sku);
            echo '<tr><td><strong>'.esc_html($post->post_title).'</strong></td><td>'.esc_html($sku).'</td><td><code>'.esc_html($pid).'</code></td><td>'.esc_html((string)$status).'</td><td>'.esc_html($sync).'</td><td>'.esc_html($note).'</td><td>';
            if($pid)self::action_form(array_merge($base,array('kind'=>'single')),'Refresh This Sneaker');
            self::action_form(array_merge($base,array('kind'=>'review')),'Check Market Mapping');
            echo '<details><summary>Manual override</summary>';
            self::action_form(array_merge($base,array('kind'=>'validate_override','candidate_product_id'=>'')),'Validate Product ID','button','candidate_product_id');
            echo '<p class="description">After validation, enter the same ID below and explicitly confirm.</p>';
            self::override_form($base);
            echo '</details></td></tr>';
        }
        echo '</tbody></table></div>';
    }
    private static function action_form($fields,$label,$class='button',$editable='') { echo '<form method="post" style="display:inline-block;margin:2px" action="'.esc_url(admin_url('admin-post.php')).'">';wp_nonce_field('lacendary_market_action');echo '<input type="hidden" name="action" value="lacendary_market_action">';foreach($fields as $key=>$value){if($key===$editable)echo '<input required name="'.esc_attr($key).'" placeholder="KicksDB product ID">';else echo '<input type="hidden" name="'.esc_attr($key).'" value="'.esc_attr($value).'">';}echo '<button class="'.esc_attr($class).'">'.esc_html($label).'</button></form>'; }
    private static function override_form($base) { echo '<form method="post" action="'.esc_url(admin_url('admin-post.php')).'">';wp_nonce_field('lacendary_market_action');echo '<input type="hidden" name="action" value="lacendary_market_action"><input type="hidden" name="kind" value="apply_override">';foreach($base as $key=>$value)echo '<input type="hidden" name="'.esc_attr($key).'" value="'.esc_attr($value).'">';echo '<p><input required name="candidate_product_id" placeholder="KicksDB product ID"></p><p><textarea required name="reason" rows="2" placeholder="Audit reason"></textarea></p><label><input required type="checkbox" name="confirm_override" value="1"> I confirm this mapping</label><br><label><input type="checkbox" name="hydrate" value="1"> Refresh immediately</label><p><button class="button">Apply Manual Override</button></p></form>'; }
}
