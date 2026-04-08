package io.stavros.tungstenrn.androidauto

import androidx.car.app.CarContext
import androidx.car.app.Screen
import androidx.car.app.model.Action
import androidx.car.app.model.ActionStrip
import androidx.car.app.model.ItemList
import androidx.car.app.model.ListTemplate
import androidx.car.app.model.Row
import androidx.car.app.model.Template

class ScreenListScreen(carContext: CarContext) : Screen(carContext) {
    override fun onGetTemplate(): Template {
        val screens = CarDataStore.loadScreens(carContext)

        if (screens.isEmpty()) {
            return androidx.car.app.model.MessageTemplate.Builder(
                "No screens configured.\nAdd screens in the Tungsten app on your phone."
            )
                .setTitle("Tungsten")
                .setHeaderAction(Action.BACK)
                .setActionStrip(
                    ActionStrip.Builder()
                        .addAction(
                            Action.Builder()
                                .setTitle("Refresh")
                                .setOnClickListener { invalidate() }
                                .build()
                        )
                        .build()
                )
                .build()
        }

        val listBuilder = ItemList.Builder()
        for (screen in screens) {
            listBuilder.addItem(
                Row.Builder()
                    .setTitle(screen.title)
                    .setBrowsable(true)
                    .setOnClickListener {
                        screenManager.push(ButtonListScreen(carContext, screen))
                    }
                    .build()
            )
        }

        return ListTemplate.Builder()
            .setTitle("Tungsten")
            .setHeaderAction(Action.BACK)
            .setActionStrip(
                ActionStrip.Builder()
                    .addAction(
                        Action.Builder()
                            .setTitle("Refresh")
                            .setOnClickListener { invalidate() }
                            .build()
                    )
                    .build()
            )
            .setSingleList(listBuilder.build())
            .build()
    }
}
