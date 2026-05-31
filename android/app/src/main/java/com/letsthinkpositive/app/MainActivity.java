package com.letsthinkpositive.app;

import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable Chrome DevTools debugging via chrome://inspect
        WebView.setWebContentsDebuggingEnabled(true);

        WebView webView = getBridge().getWebView();
        WebSettings s = webView.getSettings();

        // ── Core settings for Next.js ──────────────────────────────────────
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);

        // ── Viewport ──────────────────────────────────────────────────────
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setSupportZoom(false);
        s.setTextZoom(100); // prevent system font-size scaling breaking layout

        // ── Cache — always fetch fresh (fix stale cached broken pages) ─────
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);

        // ── Set a modern Chrome UA so the server sends the full site ───────
        // Default WebView UA can cause servers to send a stripped-down page
        String chromeUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) "
            + "AppleWebKit/537.36 (KHTML, like Gecko) "
            + "Chrome/124.0.0.0 Mobile Safari/537.36";
        s.setUserAgentString(chromeUA);

        // ── Encoding ───────────────────────────────────────────────────────
        s.setDefaultTextEncodingName("UTF-8");

        // ── Media ─────────────────────────────────────────────────────────
        s.setMediaPlaybackRequiresUserGesture(false);
    }
}
