type Platforms = "Mac" | "iOS" | "Windows" | "Android" | "Linux" | "unknown"

export const detectOS = (): Platforms => {
    const userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
        windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
        iosPlatforms = ["iPhone", "iPad", "iPod"]
    let os: Platforms = "unknown"

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = "Mac"
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = "iOS"
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = "Windows"
    } else if (/Android/.test(userAgent)) {
        os = "Android"
    } else if (!os && /Linux/.test(platform)) {
        os = "Linux"
    }

    return os
}
