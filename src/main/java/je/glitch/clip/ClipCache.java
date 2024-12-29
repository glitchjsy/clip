package je.glitch.clip;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import je.glitch.clip.models.ClipItem;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class ClipCache {
    private final Cache<String, List<ClipItem>> cache = CacheBuilder.newBuilder()
            .expireAfterAccess(10, TimeUnit.MINUTES)
            .build();

    public void addSession(String code) {
        cache.put(code, new ArrayList<>());
    }

    public void removeSession(String code) {
        cache.invalidate(code);
    }

    public List<ClipItem> getItems(String code) {
        return cache.getIfPresent(code);
    }

    public boolean sessionExists(String code) {
        List<ClipItem> items = cache.getIfPresent(code);
        return items != null;
    }

    public void addItem(String code, ClipItem item) {
        List<ClipItem> items = cache.getIfPresent(code);
        if (items == null) {
            items = new ArrayList<>();
            cache.put(code, items);
        }
        items.add(item);
    }

    public boolean removeItem(String code, String itemId) {
        List<ClipItem> items = cache.getIfPresent(code);
        if (items != null) {
            items.removeIf(item -> item.getId().toString().equalsIgnoreCase(itemId));
        }
        return false;
    }
}
