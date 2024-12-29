package je.glitch.clip.controllers;

import com.google.gson.JsonObject;
import io.javalin.http.Context;
import je.glitch.clip.ClipCache;
import je.glitch.clip.models.AddClipItemModel;
import je.glitch.clip.models.ClipItem;
import lombok.RequiredArgsConstructor;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@RequiredArgsConstructor
public class ApiController {
    private final ClipCache clipCache;

    public void handleCreateSession(Context ctx) {
        String code = generateRandomString(6);
        if (!clipCache.sessionExists(code)) {
            clipCache.addSession(code);
        }
        JsonObject result = new JsonObject();
        result.addProperty("code", code);
        ctx.json(result);
    }

    public void handleDeleteSession(Context ctx) {
        String code = ctx.pathParam("code");
        clipCache.removeSession(code);
    }

    public void handleGetSession(Context ctx) {
        String code = ctx.pathParam("code");
        List<ClipItem> items = clipCache.getItems(code);

        if (items == null) {
            JsonObject error = new JsonObject();
            error.addProperty("error", "Session not found");
            ctx.status(404).json(error);
            return;
        }
        ctx.json(items);
    }

    public void handleAddItem(Context ctx) {
        String code = ctx.pathParam("code");
        AddClipItemModel body = ctx.bodyAsClass(AddClipItemModel.class);

        ClipItem item = new ClipItem(UUID.randomUUID(), body.getText(), body.isEncrypted(), new Date().getTime());
        clipCache.addItem(code, item);

        ctx.json(item);
    }

    public void handleDeleteItem(Context ctx) {
        String code = ctx.pathParam("code");
        String itemId = ctx.pathParam("itemId");
        clipCache.removeItem(code, itemId);
    }

    private String generateRandomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        StringBuilder sb = new StringBuilder();
        ThreadLocalRandom random = ThreadLocalRandom.current();

        for (int i = 0; i < length; i ++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
