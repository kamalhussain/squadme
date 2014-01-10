#include "pebble.h"

static Window *window;

static TextLayer *name_layer;
static TextLayer *status_layer;
//static BitmapLayer *icon_layer;
//static GBitmap *icon_bitmap = NULL;

static AppSync sync;
static uint8_t sync_buffer[64];

enum WeatherKey {
    //WEATHER_ICON_KEY = 0x0,         // TUPLE_INT
    SQUADME_NAME_KEY = 0x0, // TUPLE_CSTRING
    SQUADME_MESSAGE_KEY = 0x1, // TUPLE_CSTRING
    SQUADME_DISTRESS_KEY = 0x2, // TUPLE_CSTRING
};

static const uint32_t WEATHER_ICONS[] = {
    RESOURCE_ID_IMAGE_SUN, //0
    RESOURCE_ID_IMAGE_CLOUD, //1
    RESOURCE_ID_IMAGE_RAIN, //2
    RESOURCE_ID_IMAGE_SNOW //3
};

static void sync_error_callback(DictionaryResult dict_error, AppMessageResult app_message_error, void *context) {
    APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Sync Error: %d, Dictionary error %d", app_message_error, dict_error);
}

static void sync_tuple_changed_callback(const uint32_t key, const Tuple* new_tuple, const Tuple* old_tuple, void* context) {
    light_enable(true);

    switch (key) {
            //    case WEATHER_ICON_KEY:
            //      if (icon_bitmap) {
            //        gbitmap_destroy(icon_bitmap);
            //      }
            //      icon_bitmap = gbitmap_create_with_resource(WEATHER_ICONS[new_tuple->value->uint8]);
            //      bitmap_layer_set_bitmap(icon_layer, icon_bitmap);
            //      break;

        case SQUADME_NAME_KEY:

            if (strcmp(new_tuple->value->cstring, "All") != 0) {
                vibes_long_pulse();
            }
            // App Sync keeps new_tuple in sync_buffer, so we may use it directly
            text_layer_set_text(name_layer, new_tuple->value->cstring);
            break;

        case SQUADME_MESSAGE_KEY:
            text_layer_set_text(status_layer, new_tuple->value->cstring);
            break;
    }
}

static void send_cmd(void) {
    Tuplet value = TupletInteger(1, 1);

    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);

    if (iter == NULL) {
        return;
    }

    dict_write_tuplet(iter, &value);
    dict_write_end(iter);

    app_message_outbox_send();
}

static void window_load(Window *window) {
    Layer *window_layer = window_get_root_layer(window);

    //  icon_layer = bitmap_layer_create(GRect(32, 10, 80, 80));
    //  layer_add_child(window_layer, bitmap_layer_get_layer(icon_layer));

    name_layer = text_layer_create(GRect(0, 95, 144, 68));
    text_layer_set_text_color(name_layer, GColorWhite);
    text_layer_set_background_color(name_layer, GColorClear);
    text_layer_set_font(name_layer, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
    text_layer_set_text_alignment(name_layer, GTextAlignmentCenter);
    layer_add_child(window_layer, text_layer_get_layer(name_layer));

    status_layer = text_layer_create(GRect(0, 125, 144, 68));
    text_layer_set_text_color(status_layer, GColorWhite);
    text_layer_set_background_color(status_layer, GColorClear);
    text_layer_set_font(status_layer, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
    text_layer_set_text_alignment(status_layer, GTextAlignmentCenter);
    layer_add_child(window_layer, text_layer_get_layer(status_layer));

    Tuplet initial_values[] = {
        //TupletInteger(WEATHER_ICON_KEY, (uint8_t) 1),
        TupletCString(SQUADME_NAME_KEY, "Kamal"),
        TupletCString(SQUADME_MESSAGE_KEY, "Tethered"),
    };

    app_sync_init(&sync, sync_buffer, sizeof (sync_buffer), initial_values, ARRAY_LENGTH(initial_values),
            sync_tuple_changed_callback, sync_error_callback, NULL);

    send_cmd();
}

static void window_unload(Window *window) {
    app_sync_deinit(&sync);

    //  if (icon_bitmap) {
    //    gbitmap_destroy(icon_bitmap);
    //  }

    text_layer_destroy(status_layer);
    text_layer_destroy(name_layer);
    //bitmap_layer_destroy(icon_layer);
}

static void up_single_click_handler() {
    //Tuplet symbol_tuple = TupletCString(QUOTE_KEY_SYMBOL, symbol);
    Tuplet symbol_tuple = TupletInteger(SQUADME_DISTRESS_KEY, 1);

    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);

    if (iter == NULL) {
        return;
    }

    dict_write_tuplet(iter, &symbol_tuple);
    dict_write_end(iter);

    app_message_outbox_send();
}

static void down_single_click_handler() {
    //Tuplet symbol_tuple = TupletCString(QUOTE_KEY_SYMBOL, symbol);
    Tuplet symbol_tuple = TupletInteger(SQUADME_DISTRESS_KEY, 2);

    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);

    if (iter == NULL) {
        return;
    }

    dict_write_tuplet(iter, &symbol_tuple);
    dict_write_end(iter);

    app_message_outbox_send();
}

//void config_provider(Window *window) {
static void click_config_provider(void *context) {
    window_single_click_subscribe(BUTTON_ID_UP, up_single_click_handler);
    window_single_click_subscribe(BUTTON_ID_DOWN, down_single_click_handler);
}


static void init(void) {
    window = window_create();
    window_set_background_color(window, GColorBlack);
    window_set_fullscreen(window, true);

    window_set_window_handlers(window, (WindowHandlers) {
        .load = window_load,
        .unload = window_unload
    });

    const int inbound_size = 64;
    const int outbound_size = 64;
    app_message_open(inbound_size, outbound_size);

    const bool animated = true;
    window_stack_push(window, animated);

    //CLICK
    //window_set_click_config_provider(&window, (ClickConfigProvider) config_provider);
    window_set_click_config_provider(window, click_config_provider);

}

static void deinit(void) {
    window_destroy(window);
}

int main(void) {
    init();
    app_event_loop();
    deinit();
}
