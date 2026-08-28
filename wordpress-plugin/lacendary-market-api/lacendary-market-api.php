<?php
/**
 * Plugin Name: Lacendary Market API
 * Description: Private, authenticated persistence API for Lacendary Kicks market data.
 * Version: 1.1.0
 */

if (!defined('ABSPATH')) { exit; }

final class Lacendary_Market_API {
    const VERSION = '1.1.0';
    const NS = 'lacendary-market/v1';
    const CLOCK_SKEW = 300;
    const RATE_LIMIT = 600;

    public static function boot() {
        register_activation_hook(__FILE__, array(__CLASS__, 'activate'));
        add_action('rest_api_init', array(__CLASS__, 'routes'));
        add_filter('rest_post_dispatch', array(__CLASS__, 'no_store'), 10, 3);
        require_once __DIR__ . '/lacendary-market-admin.php';
        Lacendary_Market_Admin::boot();
        if (get_option('lacendary_market_schema_version') !== self::VERSION) {
            add_action('init', array(__CLASS__, 'activate'));
        }
    }

    public static function no_store($response, $server, $request) {
        if (strpos($request->get_route(), '/' . self::NS . '/') === 0) {
            $response->header('Cache-Control', 'private, no-store, max-age=0');
        }
        return $response;
    }

    private static function tables() {
        global $wpdb;
        return array(
            'product' => $wpdb->prefix . 'lk_market_product_snapshots',
            'size' => $wpdb->prefix . 'lk_market_size_snapshots',
            'history' => $wpdb->prefix . 'lk_market_history',
            'size_history' => $wpdb->prefix . 'lk_size_market_history',
        );
    }

    public static function activate() {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $t = self::tables();
        $charset = $wpdb->get_charset_collate();
        dbDelta("CREATE TABLE {$t['product']} (
            product_id varchar(128) NOT NULL, retrieved_at datetime(6) NOT NULL, source_updated_at datetime(6) NULL,
            average_price_90 decimal(14,2) NULL, sales_count_90 bigint NULL, high_90 decimal(14,2) NULL, low_90 decimal(14,2) NULL,
            annual_average_price decimal(14,2) NULL, annual_sales_count bigint NULL, annual_high decimal(14,2) NULL, annual_low decimal(14,2) NULL,
            annual_range_high decimal(14,2) NULL, annual_range_low decimal(14,2) NULL, annual_volatility decimal(14,6) NULL,
            annual_price_premium decimal(14,6) NULL, annual_total_dollars decimal(18,2) NULL, payload longtext NOT NULL,
            PRIMARY KEY (product_id), KEY retrieved_product (retrieved_at, product_id)
        ) $charset;");
        dbDelta("CREATE TABLE {$t['size']} (
            product_id varchar(128) NOT NULL, size varchar(64) NOT NULL, variant_id varchar(128) NOT NULL,
            lowest_ask decimal(14,2) NULL, total_asks bigint NULL, sales_count_15 bigint NULL, sales_count_30 bigint NULL, sales_count_60 bigint NULL,
            currency varchar(16) NULL, market varchar(64) NULL, source_updated_at datetime(6) NULL, identifiers longtext NOT NULL, payload longtext NOT NULL,
            PRIMARY KEY (product_id, size), KEY product_variant (product_id, variant_id), KEY product_size (product_id, size)
        ) $charset;");
        dbDelta("CREATE TABLE {$t['history']} (
            product_id varchar(128) NOT NULL, observation_date date NOT NULL, market_average_price decimal(14,2) NULL,
            average_price_90 decimal(14,2) NULL, sales_count_90 bigint NULL, high_90 decimal(14,2) NULL, low_90 decimal(14,2) NULL,
            annual_average_price decimal(14,2) NULL, annual_sales_count bigint NULL, annual_high decimal(14,2) NULL, annual_low decimal(14,2) NULL,
            annual_range_high decimal(14,2) NULL, annual_range_low decimal(14,2) NULL, annual_volatility decimal(14,6) NULL,
            annual_price_premium decimal(14,6) NULL, annual_total_dollars decimal(18,2) NULL, source varchar(96) NOT NULL,
            source_updated_at datetime(6) NULL, retrieved_at datetime(6) NOT NULL, payload longtext NOT NULL,
            PRIMARY KEY (product_id, observation_date), KEY product_date (product_id, observation_date), KEY date_product (observation_date, product_id)
        ) $charset;");
        dbDelta("CREATE TABLE {$t['size_history']} (
            product_id varchar(128) NOT NULL, size varchar(64) NOT NULL, observation_date date NOT NULL, variant_id varchar(128) NOT NULL,
            lowest_ask decimal(14,2) NULL, total_asks bigint NULL, sales_count_15 bigint NULL, sales_count_30 bigint NULL, sales_count_60 bigint NULL,
            source varchar(96) NOT NULL, source_updated_at datetime(6) NULL, retrieved_at datetime(6) NOT NULL, payload longtext NOT NULL,
            PRIMARY KEY (product_id, size, observation_date), KEY product_date (product_id, observation_date),
            KEY product_size_date (product_id, size, observation_date), KEY date_product (observation_date, product_id)
        ) $charset;");
        update_option('lacendary_market_schema_version', self::VERSION, false);
        if (class_exists('Lacendary_Market_Admin')) Lacendary_Market_Admin::activate();
    }

    public static function routes() {
        register_rest_route(self::NS, '/refresh', array('methods' => 'POST', 'callback' => array(__CLASS__, 'write_refresh'), 'permission_callback' => array(__CLASS__, 'authorize')));
        register_rest_route(self::NS, '/products/(?P<product>[A-Za-z0-9-]{8,128})', array('methods' => 'POST', 'callback' => array(__CLASS__, 'read_product'), 'permission_callback' => array(__CLASS__, 'authorize')));
        register_rest_route(self::NS, '/products/(?P<product>[A-Za-z0-9-]{8,128})/sizes', array('methods' => 'POST', 'callback' => array(__CLASS__, 'read_sizes'), 'permission_callback' => array(__CLASS__, 'authorize')));
        register_rest_route(self::NS, '/products/(?P<product>[A-Za-z0-9-]{8,128})/history', array('methods' => 'POST', 'callback' => array(__CLASS__, 'read_history'), 'permission_callback' => array(__CLASS__, 'authorize')));
        register_rest_route(self::NS, '/products/(?P<product>[A-Za-z0-9-]{8,128})/sizes/history', array('methods' => 'POST', 'callback' => array(__CLASS__, 'read_size_history'), 'permission_callback' => array(__CLASS__, 'authorize')));
        register_rest_route(self::NS, '/products/(?P<product>[A-Za-z0-9-]{8,128})/sizes/(?P<size>[^/]+)/history', array('methods' => 'POST', 'callback' => array(__CLASS__, 'read_size_history'), 'permission_callback' => array(__CLASS__, 'authorize')));
        if (class_exists('Lacendary_Market_Admin')) Lacendary_Market_Admin::routes();
    }

    public static function secret() {
        return defined('LACENDARY_MARKET_API_SECRET') && is_string(LACENDARY_MARKET_API_SECRET) ? LACENDARY_MARKET_API_SECRET : '';
    }

    public static function authorize(WP_REST_Request $request) {
        if (!is_ssl()) return new WP_Error('market_https_required', 'HTTPS is required.', array('status' => 403));
        $secret = self::secret();
        if (strlen($secret) < 32) return new WP_Error('market_not_configured', 'Market API secret is not configured.', array('status' => 503));
        $timestamp = $request->get_header('x-lacendary-timestamp');
        $request_id = $request->get_header('x-lacendary-request-id');
        $signature = strtolower($request->get_header('x-lacendary-signature'));
        if (!ctype_digit((string) $timestamp) || abs(time() - intval($timestamp)) > self::CLOCK_SKEW) return new WP_Error('market_expired', 'Request timestamp is invalid or expired.', array('status' => 401));
        if (!preg_match('/^[a-f0-9-]{16,64}$/i', $request_id) || !preg_match('/^[a-f0-9]{64}$/', $signature)) return new WP_Error('market_auth_invalid', 'Authentication headers are invalid.', array('status' => 401));
        $rate_key = 'lk_market_rate_' . gmdate('YmdHi');
        $count = intval(get_transient($rate_key));
        if ($count >= self::RATE_LIMIT) return new WP_Error('market_rate_limited', 'Rate limit exceeded.', array('status' => 429));
        set_transient($rate_key, $count + 1, 120);
        $replay_key = 'lk_market_nonce_' . md5($request_id);
        if (get_transient($replay_key)) return new WP_Error('market_replay', 'Request ID has already been used.', array('status' => 409));
        $path = wp_parse_url($request->get_route(), PHP_URL_PATH);
        $body_hash = hash('sha256', $request->get_body());
        $canonical = implode("\n", array(strtoupper($request->get_method()), '/wp-json' . $path, $timestamp, $request_id, $body_hash));
        $expected = hash_hmac('sha256', $canonical, $secret);
        if (!hash_equals($expected, $signature)) return new WP_Error('market_signature_invalid', 'Signature is invalid.', array('status' => 401));
        set_transient($replay_key, 1, self::CLOCK_SKEW * 2);
        return true;
    }

    private static function exact_keys($value, $allowed, $label) {
        if (!is_array($value) || array_values($value) === $value) throw new InvalidArgumentException("$label must be an object.");
        $unknown = array_diff(array_keys($value), $allowed);
        if ($unknown) throw new InvalidArgumentException("$label contains unsupported fields: " . implode(', ', $unknown));
        foreach ($allowed as $key) if (!array_key_exists($key, $value)) throw new InvalidArgumentException("$label.$key is required.");
    }

    private static function validate_payload($r) {
        self::exact_keys($r, array('snapshot', 'overallDaily', 'sizeDaily'), 'payload');
        self::exact_keys($r['snapshot'], array('productId', 'retrievedAt', 'sourceUpdatedAt', 'last90Days', 'annual', 'sizes'), 'snapshot');
        if (!preg_match('/^[A-Za-z0-9-]{8,128}$/', $r['snapshot']['productId']) || !is_array($r['snapshot']['sizes']) || !is_array($r['overallDaily']) || !is_array($r['sizeDaily'])) throw new InvalidArgumentException('Payload identifiers or arrays are invalid.');
        self::exact_keys($r['snapshot']['last90Days'], array('averagePrice', 'salesCount', 'high', 'low'), 'snapshot.last90Days');
        self::exact_keys($r['snapshot']['annual'], array('averagePrice', 'salesCount', 'high', 'low', 'rangeHigh', 'rangeLow', 'volatility', 'pricePremium', 'totalDollars'), 'snapshot.annual');
        foreach ($r['snapshot']['sizes'] as $s) self::exact_keys($s, array('size', 'variantId', 'lowestAsk', 'totalAsks', 'salesCount15Days', 'salesCount30Days', 'salesCount60Days', 'identifiers', 'currency', 'market', 'sourceUpdatedAt'), 'snapshot.sizes[]');
        foreach ($r['overallDaily'] as $p) { self::exact_keys($p, array('productId', 'date', 'marketAveragePrice', 'last90Days', 'annual', 'source', 'sourceUpdatedAt', 'retrievedAt'), 'overallDaily[]'); self::valid_date($p['date']); }
        foreach ($r['sizeDaily'] as $p) { self::exact_keys($p, array('productId', 'size', 'variantId', 'date', 'lowestAsk', 'totalAsks', 'salesCount15Days', 'salesCount30Days', 'salesCount60Days', 'source', 'sourceUpdatedAt', 'retrievedAt'), 'sizeDaily[]'); self::valid_date($p['date']); }
        foreach (array_merge($r['overallDaily'], $r['sizeDaily']) as $p) if ($p['productId'] !== $r['snapshot']['productId']) throw new InvalidArgumentException('All product IDs must match.');
        return $r;
    }

    private static function valid_date($date) {
        $d = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
        if (!$d || $d->format('Y-m-d') !== $date) throw new InvalidArgumentException('Observation date is invalid.');
    }
    private static function dt($value) { return $value ? gmdate('Y-m-d H:i:s.u', strtotime($value)) : null; }
    private static function json($value) { return wp_json_encode($value, JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION); }
    private static function n($value) { return is_int($value) || is_float($value) ? $value : null; }

    public static function write_refresh(WP_REST_Request $request) {
        global $wpdb;
        try { $r = self::validate_payload($request->get_json_params()); }
        catch (Throwable $e) { return new WP_Error('market_payload_invalid', $e->getMessage(), array('status' => 400)); }
        $t = self::tables(); $s = $r['snapshot']; $p = $s['last90Days']; $a = $s['annual'];
        $wpdb->query('START TRANSACTION');
        try {
            $ok = $wpdb->replace($t['product'], array(
                'product_id'=>$s['productId'], 'retrieved_at'=>self::dt($s['retrievedAt']), 'source_updated_at'=>self::dt($s['sourceUpdatedAt']),
                'average_price_90'=>self::n($p['averagePrice']), 'sales_count_90'=>self::n($p['salesCount']), 'high_90'=>self::n($p['high']), 'low_90'=>self::n($p['low']),
                'annual_average_price'=>self::n($a['averagePrice']), 'annual_sales_count'=>self::n($a['salesCount']), 'annual_high'=>self::n($a['high']), 'annual_low'=>self::n($a['low']),
                'annual_range_high'=>self::n($a['rangeHigh']), 'annual_range_low'=>self::n($a['rangeLow']), 'annual_volatility'=>self::n($a['volatility']),
                'annual_price_premium'=>self::n($a['pricePremium']), 'annual_total_dollars'=>self::n($a['totalDollars']), 'payload'=>self::json($s)
            ));
            if ($ok === false) throw new RuntimeException($wpdb->last_error);
            if ($wpdb->delete($t['size'], array('product_id'=>$s['productId'])) === false) throw new RuntimeException($wpdb->last_error);
            foreach ($s['sizes'] as $z) {
                $ok = $wpdb->insert($t['size'], array('product_id'=>$s['productId'],'size'=>$z['size'],'variant_id'=>$z['variantId'],'lowest_ask'=>self::n($z['lowestAsk']),'total_asks'=>self::n($z['totalAsks']),'sales_count_15'=>self::n($z['salesCount15Days']),'sales_count_30'=>self::n($z['salesCount30Days']),'sales_count_60'=>self::n($z['salesCount60Days']),'currency'=>$z['currency'],'market'=>$z['market'],'source_updated_at'=>self::dt($z['sourceUpdatedAt']),'identifiers'=>self::json($z['identifiers']),'payload'=>self::json($z)));
                if ($ok === false) throw new RuntimeException($wpdb->last_error);
            }
            foreach ($r['overallDaily'] as $h) { $hp=$h['last90Days']; $ha=$h['annual']; $ok=$wpdb->replace($t['history'],array('product_id'=>$h['productId'],'observation_date'=>$h['date'],'market_average_price'=>self::n($h['marketAveragePrice']),'average_price_90'=>self::n($hp['averagePrice']),'sales_count_90'=>self::n($hp['salesCount']),'high_90'=>self::n($hp['high']),'low_90'=>self::n($hp['low']),'annual_average_price'=>self::n($ha['averagePrice']),'annual_sales_count'=>self::n($ha['salesCount']),'annual_high'=>self::n($ha['high']),'annual_low'=>self::n($ha['low']),'annual_range_high'=>self::n($ha['rangeHigh']),'annual_range_low'=>self::n($ha['rangeLow']),'annual_volatility'=>self::n($ha['volatility']),'annual_price_premium'=>self::n($ha['pricePremium']),'annual_total_dollars'=>self::n($ha['totalDollars']),'source'=>$h['source'],'source_updated_at'=>self::dt($h['sourceUpdatedAt']),'retrieved_at'=>self::dt($h['retrievedAt']),'payload'=>self::json($h))); if($ok===false)throw new RuntimeException($wpdb->last_error); }
            foreach ($r['sizeDaily'] as $h) { $ok=$wpdb->replace($t['size_history'],array('product_id'=>$h['productId'],'size'=>$h['size'],'observation_date'=>$h['date'],'variant_id'=>$h['variantId'],'lowest_ask'=>self::n($h['lowestAsk']),'total_asks'=>self::n($h['totalAsks']),'sales_count_15'=>self::n($h['salesCount15Days']),'sales_count_30'=>self::n($h['salesCount30Days']),'sales_count_60'=>self::n($h['salesCount60Days']),'source'=>$h['source'],'source_updated_at'=>self::dt($h['sourceUpdatedAt']),'retrieved_at'=>self::dt($h['retrievedAt']),'payload'=>self::json($h))); if($ok===false)throw new RuntimeException($wpdb->last_error); }
            $wpdb->query('COMMIT');
            return new WP_REST_Response(array('ok'=>true,'productId'=>$s['productId'],'sizes'=>count($s['sizes']),'overallHistory'=>count($r['overallDaily']),'sizeHistory'=>count($r['sizeDaily'])), 200);
        } catch (Throwable $e) { $wpdb->query('ROLLBACK'); return new WP_Error('market_persistence_failed', 'Market persistence transaction failed.', array('status'=>500)); }
    }

    private static function payloads($sql) { global $wpdb; return array_map('json_decode', $wpdb->get_col($sql)); }
    public static function read_product(WP_REST_Request $r) { global $wpdb; $t=self::tables(); $v=$wpdb->get_var($wpdb->prepare("SELECT payload FROM {$t['product']} WHERE product_id=%s",$r['product'])); return $v ? rest_ensure_response(json_decode($v)) : new WP_Error('market_not_found','Market product not found.',array('status'=>404)); }
    public static function read_sizes(WP_REST_Request $r) { global $wpdb; $t=self::tables(); return rest_ensure_response(self::payloads($wpdb->prepare("SELECT payload FROM {$t['size']} WHERE product_id=%s ORDER BY size+0,size",$r['product']))); }
    public static function read_history(WP_REST_Request $r) { global $wpdb; $t=self::tables(); return rest_ensure_response(self::payloads($wpdb->prepare("SELECT payload FROM {$t['history']} WHERE product_id=%s ORDER BY observation_date",$r['product']))); }
    public static function read_size_history(WP_REST_Request $r) { global $wpdb; $t=self::tables(); $sql=isset($r['size'])?$wpdb->prepare("SELECT payload FROM {$t['size_history']} WHERE product_id=%s AND size=%s ORDER BY observation_date",$r['product'],rawurldecode($r['size'])):$wpdb->prepare("SELECT payload FROM {$t['size_history']} WHERE product_id=%s ORDER BY observation_date,size+0,size",$r['product']); return rest_ensure_response(self::payloads($sql)); }
}

Lacendary_Market_API::boot();
