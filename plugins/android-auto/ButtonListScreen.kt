package io.stavros.tungstenrn.androidauto

import androidx.car.app.CarContext
import androidx.car.app.Screen
import androidx.car.app.model.Action
import androidx.car.app.model.ActionStrip
import androidx.car.app.model.GridItem
import androidx.car.app.model.GridTemplate
import androidx.car.app.model.ItemList
import androidx.car.app.model.MessageTemplate
import androidx.car.app.model.Template

class ButtonListScreen(
    carContext: CarContext,
    private val screen: ScreenData
) : Screen(carContext) {
    override fun onGetTemplate(): Template {
        val listBuilder = ItemList.Builder()
        for (button in screen.ui) {
            if (button.label.isBlank()) continue
            listBuilder.addItem(
                GridItem.Builder()
                    .setTitle(button.label)
                    .setImage(colorCircleIcon(button.label))
                    .setOnClickListener {
                        CarActionExecutor.execute(carContext, button.url)
                    }
                    .build()
            )
        }

        val itemList = listBuilder.build()
        if (itemList.items.isEmpty()) {
            return MessageTemplate.Builder("No buttons configured.")
                .setTitle(screen.title)
                .setHeaderAction(Action.BACK)
                .addAction(
                    Action.Builder()
                        .setTitle("Refresh")
                        .setOnClickListener { invalidate() }
                        .build()
                )
                .build()
        }

        return GridTemplate.Builder()
            .setTitle(screen.title)
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
            .setSingleList(itemList)
            .build()
    }
}
