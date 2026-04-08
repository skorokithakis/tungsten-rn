package io.stavros.tungstenrn.androidauto

import android.content.Intent
import androidx.car.app.Screen
import androidx.car.app.Session

class TungstenSession : Session() {
    override fun onCreateScreen(intent: Intent): Screen {
        return MainCarScreen(carContext)
    }
}
