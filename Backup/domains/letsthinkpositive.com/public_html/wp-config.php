<?php
define( 'WP_CACHE', true );

/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'u523528224_MliAC' );

/** Database username */
define( 'DB_USER', 'u523528224_ORJcL' );

/** Database password */
define( 'DB_PASSWORD', 'hH2Bm7hi2I' );

/** Database hostname */
define( 'DB_HOST', '127.0.0.1' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          'Q5![}WV3w|LX05C^VP|@1Fvyl^ho@`UuB^^4bk WMXP=(P&U*r$!mSu`-SwlR>Z$' );
define( 'SECURE_AUTH_KEY',   'dn*iB@bzrKQ&}43(J&i&Q>U@K-x`x7|lN{i|)RwwG}wIgpdvXZ})4^y4QW!;A]or' );
define( 'LOGGED_IN_KEY',     '6^krB&lt]R*ij7>}6iL=iDI)Wx}J1eUpQ8JV&)(tt:vM2`1dlNL,t}e=QO#F:siV' );
define( 'NONCE_KEY',         ' )ez[t3fOEITr`1V>^sp*{a]sg,I2tbX`0(;+v=B+K6r!<ubx{i.POjrJ!fp0eS7' );
define( 'AUTH_SALT',         'U6;91T:9@6V+ItY62c_?8O6Y6:DWehwdwjX}r;{|?-l_Y+J[WOCiD2^ht]4(nh}D' );
define( 'SECURE_AUTH_SALT',  '0)W4?C JXQ!R$&TkJGd#qtg//^l%r*$XUq{QU)`IMZsq7e.huv@V4)N9b)~<p:Uc' );
define( 'LOGGED_IN_SALT',    'A<Dl1`RJ8#]O(4COGiD^+J7F!?% PjMOe<HeB(Rlg_E^/ZEy;nxH Xfhh7fvA_bb' );
define( 'NONCE_SALT',        'PCSrxiji5~j8PtOUIxdK{G/|8AA#O(&h OZ<tMHpxsQmrK 1d$?t4*`ras.[44H{' );
define( 'WP_CACHE_KEY_SALT', 'j6Vp4WV3(#`e3 =$kFaJn0/)Wr^K~?OQGY|#96TPza0yi~i[,$e4U|<Ws{K^yd!u' );


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';


/* Add any custom values between this line and the "stop editing" line. */



/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

define( 'FS_METHOD', 'direct' );
define( 'COOKIEHASH', '4b0bb59e34b1f557d88b7eadc805f93c' );
define( 'WP_AUTO_UPDATE_CORE', 'minor' );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
