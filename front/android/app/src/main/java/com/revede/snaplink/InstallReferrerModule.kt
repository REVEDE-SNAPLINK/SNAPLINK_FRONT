package com.revede.snaplink

import android.os.RemoteException
import com.android.installreferrer.api.InstallReferrerClient
import com.android.installreferrer.api.InstallReferrerStateListener
import com.android.installreferrer.api.ReferrerDetails
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * React Native 네이티브 모듈 — Google Play Install Referrer API 브릿지
 *
 * Play Store 설치 시 URL에 포함된 referrer 문자열을 JS에 전달한다.
 * (예: "link_code=l1_abc123" → JS에서 파싱 후 tracking_code 복원)
 *
 * 참조: https://developer.android.com/google/play/installreferrer
 */
class InstallReferrerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "InstallReferrer"

    @ReactMethod
    fun getInstallReferrer(promise: Promise) {
        val client = InstallReferrerClient.newBuilder(reactContext).build()

        client.startConnection(object : InstallReferrerStateListener {
            override fun onInstallReferrerSetupFinished(responseCode: Int) {
                when (responseCode) {
                    InstallReferrerClient.InstallReferrerResponse.OK -> {
                        try {
                            val details: ReferrerDetails = client.installReferrer
                            val referrerUrl = details.installReferrer
                            client.endConnection()
                            promise.resolve(referrerUrl)
                        } catch (e: RemoteException) {
                            client.endConnection()
                            promise.reject("REFERRER_ERROR", e.message ?: "RemoteException")
                        }
                    }
                    // Play Store 미지원 기기 또는 사이드로드 설치
                    InstallReferrerClient.InstallReferrerResponse.FEATURE_NOT_SUPPORTED -> {
                        client.endConnection()
                        promise.resolve(null)
                    }
                    // 서비스 일시적 불가
                    InstallReferrerClient.InstallReferrerResponse.SERVICE_UNAVAILABLE -> {
                        client.endConnection()
                        promise.resolve(null)
                    }
                    else -> {
                        client.endConnection()
                        promise.resolve(null)
                    }
                }
            }

            override fun onInstallReferrerServiceDisconnected() {
                // 연결이 끊어진 경우 — promise가 이미 resolve 됐을 수 있음
                // 중복 resolve는 React Native가 무시함
                promise.resolve(null)
            }
        })
    }
}
