import { flatMap, groupBy, mapValues, Dictionary, pickBy, keys, values } from "lodash";
import { isValid } from "../src/anticheat";

require('dotenv').config()

const data = {
    "serverreport" : "true",
    "ended" : "True",
    "name" : "Capture the Flag",
    "timelimit" : 20,
    "players" : [ 
        {
            "name" : "Mentos Aquakiss",
            "ping" : 13,
            "starttime" : 0,
            "voice" : "QuickChatPhoenix1",
            "team" : "Blood Eagle",
            "score" : 6,
            "kills" : 1,
            "deaths" : 3,
            "offense" : 1,
            "defense" : 2,
            "style" : 3,
            "isUntracked" : true,
            "killStatCTF" : 1,
            "suicideStatCTF" : 2,
            "StatTeamKill" : 0,
            "StatHighestSpeed" : 222,
            "StatDamageBlaster" : 0,
            "StatDamageBuckler" : 0,
            "StatDamageBurner" : 0,
            "StatDamageChaingun" : 0,
            "StatDamageGrenadeLauncher" : 0,
            "StatDamageMortar" : 0,
            "StatDamageRocketPod" : 0,
            "StatDamageSpinfusor" : 172,
            "statHS" : 0,
            "xsExtendedStat" : 0,
            "statEBMA" : 0,
            "statMA" : 3,
            "statMAPlus" : 0,
            "statMASupreme" : 0,
            "statEatDisc" : 0,
            "statDistanceSpinfusor" : 117,
            "statDistanceSniper" : 0,
            "statPMA" : 0,
            "statGLMA" : 0,
            "statMMA" : 0,
            "statSweetShot" : 0,
            "statOMG" : 0,
            "statRocketeer" : 0,
            "StatDestroyGenerator" : 0,
            "StatDestroySensor" : 0,
            "StatRepairGenerator" : 0,
            "StatRepairSensor" : 0,
            "StatRepairInventory" : 0,
            "StatFlagDefend" : 0,
            "StatFlagAttack" : 0,
            "flagPickupStat" : 1,
            "StatFlagCarrierKill" : 1,
            "flagCaptureStat" : 0,
            "flagReturnStat" : 1
        }, 
        {
            "name" : "keelei4",
            "ping" : 30,
            "starttime" : 0,
            "voice" : "QuickChatBloodEagle1",
            "team" : "Phoenix",
            "score" : 5,
            "kills" : 1,
            "deaths" : 3,
            "offense" : 1,
            "defense" : 1,
            "style" : 3,
            "isUntracked" : true,
            "killStatCTF" : 1,
            "suicideStatCTF" : 2,
            "StatTeamKill" : 0,
            "StatHighestSpeed" : 238,
            "StatDamageBlaster" : 0,
            "StatDamageBuckler" : 0,
            "StatDamageBurner" : 0,
            "StatDamageChaingun" : 0,
            "StatDamageGrenadeLauncher" : 0,
            "StatDamageMortar" : 0,
            "StatDamageRocketPod" : 0,
            "StatDamageSpinfusor" : 131,
            "statHS" : 0,
            "xsExtendedStat" : 0,
            "statEBMA" : 0,
            "statMA" : 1,
            "statMAPlus" : 2,
            "statMASupreme" : 0,
            "statEatDisc" : 0,
            "statDistanceSpinfusor" : 0,
            "statDistanceSniper" : 0,
            "statPMA" : 0,
            "statGLMA" : 0,
            "statMMA" : 0,
            "statSweetShot" : 0,
            "statOMG" : 0,
            "statRocketeer" : 0,
            "StatDestroyGenerator" : 0,
            "StatDestroySensor" : 0,
            "StatRepairGenerator" : 0,
            "StatRepairSensor" : 0,
            "StatRepairInventory" : 0,
            "StatFlagDefend" : 0,
            "StatFlagAttack" : 0,
            "flagPickupStat" : 3,
            "StatFlagCarrierKill" : 0,
            "flagCaptureStat" : 0,
            "flagReturnStat" : 1
        }
    ],
    "port" : 7777
}

async function main() {
    console.warn(isValid(data.players[0], data), isValid(data.players[1], data));
}

main()
.then(() => {
    console.info('All done');
    process.exit(0);
})
.catch(ex => {
    console.error("Fatal in main");
    console.error(ex);
    process.exit(1);
});
