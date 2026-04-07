package io.stavros.tungstenrn.androidauto

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import org.json.JSONArray

data class ScreenData(val id: String, val title: String, val ui: List<ButtonData>)
data class ButtonData(val label: String, val span: Int, val url: String, val height: Int = 1)

object CarDataStore {
    fun loadScreens(context: Context): List<ScreenData> {
        val dbPath = context.getDatabasePath("RKStorage")
        if (!dbPath.exists()) return emptyList()

        return try {
            val db = SQLiteDatabase.openDatabase(
                dbPath.path, null, SQLiteDatabase.OPEN_READONLY
            )
            val json = try {
                val cursor = db.rawQuery(
                    "SELECT value FROM catalystLocalStorage WHERE key = ?",
                    arrayOf("@screens")
                )
                val result = if (cursor.moveToFirst()) cursor.getString(0) else ""
                cursor.close()
                result
            } finally {
                db.close()
            }

            if (json.isEmpty()) emptyList() else parseScreensJson(json)
        } catch (e: Exception) {
            emptyList()
        }
    }

    private fun parseScreensJson(json: String): List<ScreenData> {
        val jsonArray = JSONArray(json)
        val screens = mutableListOf<ScreenData>()

        for (i in 0 until jsonArray.length()) {
            val obj = jsonArray.getJSONObject(i)
            val buttons = mutableListOf<ButtonData>()
            val uiArray = obj.getJSONArray("ui")

            for (j in 0 until uiArray.length()) {
                val btnObj = uiArray.getJSONObject(j)
                buttons.add(
                    ButtonData(
                        label = btnObj.optString("label", ""),
                        span = btnObj.optInt("span", 1),
                        url = btnObj.optString("url", ""),
                        height = btnObj.optInt("height", 1)
                    )
                )
            }

            screens.add(
                ScreenData(
                    id = obj.optString("id", ""),
                    title = obj.optString("title", ""),
                    ui = buttons
                )
            )
        }

        return screens
    }
}
