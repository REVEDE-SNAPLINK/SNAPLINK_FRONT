# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

-keep class com.kakao.sdk.**.model.* { <fields>; }
-keep class * extends com.google.gson.TypeAdapter
# 카카오 SDK 모델 및 내부 클래스 전체 보호
-keep class com.kakao.sdk.**.model.** { *; }
-keep class com.kakao.sdk.auth.AuthCodeClient$* { *; }
-keep class com.kakao.sdk.common.util.KakaoResultReceiver { *; }
-keep interface com.kakao.sdk.**.*Api { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# https://github.com/square/okhttp/pull/6792
-dontwarn org.bouncycastle.jsse.**
-dontwarn org.conscrypt.*
-dontwarn org.openjsse.**

-if interface * { @retrofit2.http.* <methods>; }
-keep,allowobfuscation interface <1>
-keep,allowobfuscation,allowshrinking class kotlin.coroutines.Continuation
-if interface * { @retrofit2.http.* public *** *(...); }
-keep,allowoptimization,allowshrinking,allowobfuscation class <3>
-keep,allowobfuscation,allowshrinking class retrofit2.Response
# 제네릭 및 애노테이션 정보 유지
-keepattributes Signature, *Annotation*, EnclosingMethod, InnerClasses

# Gson이 리플렉션을 통해 접근하는 모든 SerializedName 필드 보호
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep,allowobfuscation @interface com.google.gson.annotations.SerializedName

# React Native Reanimated (화이트 스크린 및 초기화 오류 방지)
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# react-native-svg (렌더링 크래시 방지)
-keep public class com.horcrux.svg.** { *; }