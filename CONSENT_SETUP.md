# Advertising consent deployment

The site loads Google Funding Choices from `globalNav/consentManager.js`. Funding Choices is Google’s certified consent-management platform, but the message must also be published in the AdSense account for publisher `pub-5140172230633441`.

Before deploying:

1. Open **AdSense → Privacy & messaging → European regulations**.
2. Create or review the message for `bludle.com`.
3. Include consent, reject and manage-options choices, then publish the message.
4. Confirm the privacy-policy URL is `https://bludle.com/privacy`.
5. Test from the UK/EEA in a clean browser profile. The message must appear before an AdSense request, and **Review advertising privacy choices** on the privacy page must reopen it.

Do not restore direct `pagead2.googlesyndication.com` script tags to HTML pages. The consent manager deliberately loads AdSense only from the `CONSENT_DATA_READY` callback. Analytics storage defaults to denied; Google Analytics and Mixpanel are not loaded unless the required analytics purposes are granted.
