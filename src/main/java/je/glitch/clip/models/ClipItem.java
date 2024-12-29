package je.glitch.clip.models;

import lombok.Data;

import java.util.Date;
import java.util.UUID;

@Data
public class ClipItem {
    private final UUID id;
    private final String text;
    private final Date creationDate;
}
