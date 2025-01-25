import PogObject from "PogData";

const C08PacketPlayerBlockPlacement = Java.type("net.minecraft.network.play.client.C08PacketPlayerBlockPlacement");
const S08PacketPlayerPosLook = Java.type("net.minecraft.network.play.server.S08PacketPlayerPosLook");
const C0APacketAnimation = Java.type("net.minecraft.network.play.client.C0APacketAnimation");

const dataObject = new PogObject("ZeroPingInteract", {
    enabled: false,
    debugMode: false,
}, "data.json");

register("command", (arg) => {
    if (!arg) {
        ChatLib.chat("&b[&3ZPI&b] Commands:");
        ChatLib.chat("&b/zpi toggle - &3Toggle the module");
        ChatLib.chat("&b/zpi debug - &3Toggle debug mode");
        return;
    }

    switch (arg.toLowerCase()) {
        case "toggle":
            dataObject.enabled = !dataObject.enabled;
            ChatLib.chat(`&b[&3ZPI&b] Module ${dataObject.enabled ? "&aenabled" : "&cdisabled"}.`);
            break;
        case "debug":
            dataObject.debugMode = !dataObject.debugMode;
            ChatLib.chat(`&b[&3ZPI&b] Debug mode ${dataObject.debugMode ? "&aenabled" : "&cdisabled"}.`);
            break;
        default:
            ChatLib.chat("&cUnknown command. Use &b/zpi&c for help.");
    }
    dataObject.save();
}).setName("zeropinginteract").setAliases(["zpi"]);

const simulateInteract = (block) => {
    if (!block) return;

    try {
        if (dataObject.debugMode) {
            ChatLib.chat(`&b[&3ZPI&b] » Simulating interact with block at ${block.getX()}, ${block.getY()}, ${block.getZ()}`);
        }

        Client.sendPacket(new C0APacketAnimation());
        
        const placementPacket = new C08PacketPlayerBlockPlacement(
            block.getX(),
            block.getY(),
            block.getZ(),
            block.getFace(),
            Player.getHeldItem(),
            0, 0, 0
        );
        
        Client.sendPacket(placementPacket);

        if (dataObject.debugMode) {
            ChatLib.chat("&b[&3ZPI&b] » Interact simulated!");
        }
    } catch (e) {
        if (dataObject.debugMode) {
            ChatLib.chat(`&c[&3ZPI&b] » Error: ${e.message}`);
        }
    }
};

register("packetSent", (packet) => {
    if (!dataObject.enabled) return;

    if (packet instanceof C08PacketPlayerBlockPlacement) {
        if (dataObject.debugMode) {
            ChatLib.chat("&b[&3ZPI&b] » Block placement packet detected!");
        }

        try {
            const block = Player.lookingAt();
            if (block) {
                simulateInteract(block);
            }
        } catch (e) {
            if (dataObject.debugMode) {
                ChatLib.chat(`&c[&3ZPI&b] » Error: ${e.message}`);
            }
        }
    }
});

register("worldLoad", () => {
    dataObject.save();
});
