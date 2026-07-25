"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

export function isAnalyticsEnabled() {
  return process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
}

export function Analytics() {
  const pathname = usePathname();

  const enabled = isAnalyticsEnabled();

  // Do not track on admin or dashboard pages
  const isExcludedPath = pathname?.startsWith("/admin") || pathname?.includes("/dashboard");

  // Track PageView on client-side routing changes
  useEffect(() => {
    if (enabled && !isExcludedPath && typeof window !== "undefined") {
      const windowObj = window as any;
      if (windowObj.fbq) {
        windowObj.fbq('track', 'PageView');
      }
    }
  }, [pathname, enabled, isExcludedPath]);

  if (!enabled || isExcludedPath) {
    return null;
  }

  return (
    <>
      {/* Mixpanel Analytics */}
      <Script
        id="mixpanel-analytics"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `(function(e,c){if(!c.__SV){var l,h;window.mixpanel=c;c._i=[];c.init=function(q,r,f){function t(d,a){var g=a.split(".");2==g.length&&(d=d[g[0]],a=g[1]);d[a]=function(){d.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var b=c;"undefined"!==typeof f?b=c[f]=[]:f="mixpanel";b.people=b.people||[];b.toString=function(d){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);d||(a+=" (stub)");return a};b.people.toString=function(){return b.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders start_session_recording stop_session_recording people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
for(h=0;h<l.length;h++)t(b,l[h]);var n="set set_once union unset remove delete".split(" ");b.get_group=function(){function d(p){a[p]=function(){b.push([g,[p].concat(Array.prototype.slice.call(arguments,0))])}}for(var a={},g=["get_group"].concat(Array.prototype.slice.call(arguments,0)),m=0;m<n.length;m++)d(n[m]);return a};c._i.push([q,r,f])};c.__SV=1.2;var k=e.createElement("script");k.type="text/javascript";k.async=!0;k.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===
e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=e.getElementsByTagName("script")[0];e.parentNode.insertBefore(k,e)}})(document,window.mixpanel||[]);

mixpanel.init('0beaa745cfdd0f7034129b19eca5bcc2', {
  autocapture: true,
  record_sessions_percent: 10,
});`,
        }}
      />
      {/* Google Tag Manager */}
      <Script
        id="google-tag-manager"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TZ23QHHM');`,
        }}
      />


    </>
  );
}

export function AnalyticsNoScript() {
  const pathname = usePathname();

  const enabled = isAnalyticsEnabled();

  // Do not track on admin or dashboard pages
  const isExcludedPath = pathname?.startsWith("/admin") || pathname?.includes("/dashboard");

  if (!enabled || isExcludedPath) {
    return null;
  }

  return (
    <>
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-TZ23QHHM"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none", visibility: "hidden" }}
          src="https://www.facebook.com/tr?id=870505078824287&ev=PageView&noscript=1"
        />
      </noscript>
    </>
  );
}
