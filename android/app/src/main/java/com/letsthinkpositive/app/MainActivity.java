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

        // Enable WebView debugging in Chrome (chrome://inspect)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
    }

    @Override
    protected void onStart() {
        super.onStart();

        WebView webView = getBridge().getWebView();
        WebSettings s   = webView.getSettings();

        // Required for Next.js to load correctly
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);

        // Proper mobile viewport
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setSupportZoom(false);

        // Cache — use network when available, fall back to cache offline
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Allow cross-origin requests needed by Next.js assets
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setAllowFileAccessFromFileURLs(false);

        // Keep the standard Chrome UA — some servers block custom UAs
        // We do NOT change it so the server serves the normal desktop/mobile site
    }
}
