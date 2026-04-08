package io.stavros.tungstenrn.androidauto

import androidx.car.app.CarContext
import androidx.car.app.CarToast
import java.net.HttpURLConnection
import java.net.URL

object CarActionExecutor {
    fun execute(carContext: CarContext, url: String) {
        Thread {
            try {
                val connection = URL(url).openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.connectTimeout = 10000
                connection.readTimeout = 10000
                connection.doOutput = true
                connection.outputStream.use { it.write("{}".toByteArray()) }
                val responseCode = connection.responseCode
                connection.disconnect()

                if (responseCode in 200..299) {
                    CarToast.makeText(carContext, "Action sent", CarToast.LENGTH_SHORT).show()
                } else {
                    CarToast.makeText(carContext, "Action failed ($responseCode)", CarToast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                CarToast.makeText(carContext, "Connection error", CarToast.LENGTH_SHORT).show()
            }
        }.start()
    }
}
