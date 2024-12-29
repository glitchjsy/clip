package je.glitch.clip.models;

import lombok.Data;

@Data
public class AddClipItemModel {
    private final String text;
    private final boolean encrypted;
}
