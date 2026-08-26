/**
 * Named state fixtures for the dev harness. Entity names mirror the worked
 * example in the README: a Music Assistant player, a Chromecast Audio, four
 * receiver zones (Yamaha shaped), six amp zones (Monoprice shaped, slow to
 * confirm), one group helper, and one amp master takeover entity.
 */

import type { HassEntity } from "../src/types";

const VOLUME_FEATURES = 4 | 8; // VOLUME_SET | VOLUME_MUTE

function entity(
  entityId: string,
  state: string,
  attributes: HassEntity["attributes"] = {},
): HassEntity {
  return { entity_id: entityId, state, attributes };
}

function receiverZone(
  entityId: string,
  name: string,
  state: string,
  source?: string,
  volume = 0.4,
): HassEntity {
  return entity(entityId, state, {
    friendly_name: name,
    source,
    source_list: ["AUDIO2", "AV1", "HDMI1", "NET RADIO", "TUNER"],
    volume_level: volume,
    is_volume_muted: false,
    supported_features: VOLUME_FEATURES,
  });
}

function ampZone(
  entityId: string,
  name: string,
  state: string,
  source?: string,
  volume = 0.5,
): HassEntity {
  return entity(entityId, state, {
    friendly_name: name,
    source,
    source_list: ["Source 1", "Source 2", "Source 3"],
    volume_level: volume,
    is_volume_muted: false,
    supported_features: VOLUME_FEATURES,
  });
}

export const SLOW_ENTITIES = [
  "media_player.amp_zone_11",
  "media_player.amp_zone_12",
  "media_player.amp_zone_13",
  "media_player.unit_1_master",
];

const GROUP_MEMBERS = [
  "media_player.receiver_zone2",
  "media_player.amp_zone_11",
];

function baseStates(): Record<string, HassEntity> {
  const states: Record<string, HassEntity> = {};
  const put = (e: HassEntity) => {
    states[e.entity_id] = e;
  };
  put(
    entity("media_player.music_assistant_living", "idle", {
      friendly_name: "Music Assistant",
    }),
  );
  put(
    entity("media_player.chromecast_audio", "off", {
      friendly_name: "Chromecast Audio",
    }),
  );
  put(receiverZone("media_player.receiver_main", "Great Room", "off"));
  put(receiverZone("media_player.receiver_zone2", "Office", "off"));
  put(receiverZone("media_player.receiver_zone3", "Patio", "off"));
  put(ampZone("media_player.amp_zone_11", "Kitchen", "off"));
  put(ampZone("media_player.amp_zone_12", "Dining", "off"));
  put(ampZone("media_player.amp_zone_13", "Garage", "off"));
  put(
    entity("media_player.downstairs", "off", {
      friendly_name: "Downstairs",
      entity_id: GROUP_MEMBERS,
    }),
  );
  put(ampZone("media_player.unit_1_master", "Amp All Zones", "off"));
  return states;
}

export const scenarios: Record<string, () => Record<string, HassEntity>> = {
  "all-off": baseStates,

  "playing-two-zones": () => {
    const s = baseStates();
    s["media_player.music_assistant_living"] = entity(
      "media_player.music_assistant_living",
      "playing",
      {
        friendly_name: "Music Assistant",
        media_title: "So What",
        media_artist: "Miles Davis",
      },
    );
    s["media_player.chromecast_audio"] = entity(
      "media_player.chromecast_audio",
      "playing",
      {
        friendly_name: "Chromecast Audio",
        app_name: "Music Assistant",
        volume_level: 1,
      },
    );
    s["media_player.receiver_main"] = receiverZone(
      "media_player.receiver_main",
      "Great Room",
      "on",
      "AUDIO2",
      0.35,
    );
    s["media_player.amp_zone_11"] = ampZone(
      "media_player.amp_zone_11",
      "Kitchen",
      "on",
      "Source 2",
      0.58,
    );
    return s;
  },

  "cast-off": () => {
    const s = scenarios["playing-two-zones"]!();
    s["media_player.chromecast_audio"] = entity(
      "media_player.chromecast_audio",
      "off",
      { friendly_name: "Chromecast Audio" },
    );
    return s;
  },

  "zone-unavailable": () => {
    const s = baseStates();
    s["media_player.receiver_zone3"] = entity(
      "media_player.receiver_zone3",
      "unavailable",
      { friendly_name: "Patio" },
    );
    delete s["media_player.amp_zone_13"];
    return s;
  },

  "source-unknown": () => {
    const s = baseStates();
    s["media_player.receiver_main"] = receiverZone(
      "media_player.receiver_main",
      "Great Room",
      "on",
      "Unknown",
    );
    s["media_player.amp_zone_12"] = ampZone(
      "media_player.amp_zone_12",
      "Dining",
      "on",
      "Source 1",
    );
    return s;
  },

  "group-partial": () => {
    const s = scenarios["playing-two-zones"]!();
    s["media_player.receiver_zone2"] = receiverZone(
      "media_player.receiver_zone2",
      "Office",
      "off",
    );
    return s;
  },
};

export const BROWSE_TREE = {
  title: "Music Assistant",
  media_class: "directory",
  media_content_type: "library",
  media_content_id: "library",
  can_play: false,
  can_expand: true,
  children: [
    {
      title: "Playlists",
      media_class: "directory",
      media_content_type: "playlists",
      media_content_id: "library://playlist",
      can_play: false,
      can_expand: true,
      children: [
        {
          title: "Dinner Jazz",
          media_class: "playlist",
          media_content_type: "playlist",
          media_content_id: "library://playlist/1",
          can_play: true,
          can_expand: false,
        },
        {
          title: "Saturday Cleaning",
          media_class: "playlist",
          media_content_type: "playlist",
          media_content_id: "library://playlist/2",
          can_play: true,
          can_expand: false,
        },
      ],
    },
    {
      title: "Radio",
      media_class: "directory",
      media_content_type: "radios",
      media_content_id: "library://radio",
      can_play: false,
      can_expand: true,
      children: [
        {
          title: "KEXP",
          media_class: "music",
          media_content_type: "radio",
          media_content_id: "library://radio/1",
          can_play: true,
          can_expand: false,
        },
      ],
    },
  ],
};
