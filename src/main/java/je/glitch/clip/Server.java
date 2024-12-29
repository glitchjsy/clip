package je.glitch.clip;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.javalin.Javalin;
import io.javalin.json.JsonMapper;
import io.javalin.rendering.template.JavalinFreemarker;
import je.glitch.clip.controllers.ApiController;
import org.jetbrains.annotations.NotNull;

import java.lang.reflect.Type;

public class Server {
    public static final Gson GSON = new GsonBuilder()
            .setPrettyPrinting()
            .serializeNulls()
            .create();

    private final ApiController apiController;
    private final ClipCache clipCache;

    public Server() {
        this.clipCache = new ClipCache();
        this.apiController = new ApiController(clipCache);
    }

    public static void main(String[] args) {
        new Server().startup();
    }

    private void startup() {
        JsonMapper gsonMapper = new JsonMapper() {
            @Override
            public String toJsonString(@NotNull Object obj, @NotNull Type type) {
                return GSON.toJson(obj, type);
            }

            @Override
            public <T> T fromJsonString(@NotNull String json, @NotNull Type targetType) {
                return GSON.fromJson(json, targetType);
            }

        };
        Javalin app = Javalin.create(servlet -> {
            servlet.staticFiles.add("/app");
            servlet.spaRoot.addFile("/", "/app/index.html");
            servlet.fileRenderer(new JavalinFreemarker());
            servlet.jsonMapper(gsonMapper);

//            servlet.bundledPlugins.enableCors(cors -> {
//                cors.addRule(it -> {
//                    it.anyHost();
//                });
//            });
        }).start(8038);

        app.get("/health", ctx -> ctx.result("OK"));
        app.post("/api/session/new", apiController::handleCreateSession);
        app.get("/api/session/{code}", apiController::handleGetSession);
        app.delete("/api/session/{code}", apiController::handleDeleteSession);
        app.post("/api/session/{code}/items", apiController::handleAddItem);
        app.delete("/api/session/{code}/items/{itemId}", apiController::handleDeleteItem);
    }
}
