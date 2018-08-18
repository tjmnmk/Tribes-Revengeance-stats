import winston from "winston";
import moment from "moment";
import countryNames from "../data/countrynames.json";
import availableMapImages from "../data/available-map-images.json";
import timespan from  "timespan";
import github from 'octonode';
import path from 'path';
import sha1File from 'sha1-file';
import tags from '../data/clan-tags.json';
import { removeDiacritics } from "./removeAccents";
import { Request } from "../node_modules/@types/express-serve-static-core";
import { INews } from "./types";

export function tryConvertIpv6ToIpv4(ip: string){
    var regex = /^::ffff:([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})$/;
    var matches = regex.exec(ip);
    
    if(matches && matches.length == 2){
        return matches[1];
    } else {
        return ip;
    }
}

export function getNews() {
    winston.info("Resolving news");

    return new Promise<INews[]>(function (resolve, reject) {
        var client = github.client();
        var repo = client.repo('jkelin/Tribes-Revengeance-stats');
        
        repo.commits(function (error, commits) {
            if (error) {
                winston.error(error.message);

                return reject(error);
            } else {
                var data: INews[] = [];

                for (var i in commits) {
                    var message = commits[i].commit.message;
                    var dateStr = commits[i].commit.author.date;
                    var url = commits[i].html_url;
                    var date = new Date(dateStr);

                    data.push({
                        message: message,
                        date: date,
                        url: url
                    });
                }

                winston.info("News resolved");

                return resolve(data);
            }
        });
    })
}

export const tribes_news = getNews().catch(() => []);

export function getClientIp(req: Request) {
    var ipAddress;
    var forwardedIpsStr = req.header('x-forwarded-for');

    if (forwardedIpsStr) {
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }

    if (!ipAddress) {
        ipAddress = req.connection.remoteAddress;
    }

    return ipAddress && tryConvertIpv6ToIpv4(ipAddress);
};

export function aIncludesB(a: string[], b: string[]) {
    for (let i in b) {
        if (a.filter(x => x.indexOf(b[i]) != -1).length == 0) return false;
    }

    return true;
}

export function getFullMapName(map: string){
    const mapImageComponentMap = availableMapImages.map(x => ({map: x, components: x.split(/[- ]/g)}));

    let searchComponents = map.toLowerCase().replace(/[\[\]\-\_\(\)\<\>]/g, " ").replace(".tvm", "").split(" ").filter(x => x);

    let possibleMaps = mapImageComponentMap
        .filter(x => aIncludesB(x.components, searchComponents));

    if (!possibleMaps.length) return undefined;
    else return possibleMaps.map(x => x.map).sort()[0];
}

export const handlebars_helpers: Record<string, (...params: any[]) => string> = {
    json: function (context) { return JSON.stringify(context); },
    urlencode: function (context) { return encodeURIComponent(context); },
    showMinutes: function (context) {
        var span = new timespan.TimeSpan();
        span.addMinutes(parseInt(context));
        var str = "";
        if (span.days == 1) str += span.days + " day ";
        else if (span.days != 0) str += span.days + " days ";
        if (span.hours != 0) str += span.hours + " hours ";
        if (str != "") str += "and ";
        str += span.minutes + " minutes";
        return str;
    },
    showMoment: function (context) { return moment(context).fromNow(); },
    translateStatName: function (context) {
        var table = require("../data/statnames.json");
        for (var i in table) {
            if (context == i) return table[i];
        };
        return context;
    },
    killsperminute: function (context) {
        if(!context.kills && !context.deaths){
            return "";
        }

        return ((context.kills || 0) / (context.minutesonline || 1)).toFixed(2); 
    },
    inc: function (num) { return num + 1; },
    countryname: function (country, options) { return country && countryNames[country.toUpperCase()]; },
    condPrint: function (v1, v2, v3) {
        return (v1 == v2) ? v3 : "";
    },
    emptyIfZero: function (context, num) {
        if(context.kills || context.deaths) {
            return num || 0;
        }

        if(typeof(num) !== "number") {
            return num;
        }

        if(Math.abs(num) < 0.0001) {
            return "";
        }

        return num;
    },
    mapImage: function(map, kind = "loadscreens-chopped", thumbnail = true) {
        let baseUrl = kind == "loadscreens-chopped" && thumbnail == true
            ? "/static"
            : "https://downloads.tribesrevengeance.net/map-images";

        return `${baseUrl}/${kind}${thumbnail ? "-thumbnails" : ""}/${map}.jpg`;
    },
    mapName: function(map = '') {
        let splat = map.split("-");
        return splat[splat.length - 1].replace(/\(.*\)|\.tvm|BEML[0-9]/g, "").trim();
    },
    humanDate: function(date) {
        return moment(date).format('YYYY-MM-DD');
    },
    humanTime: function(date) {
        return moment(date).format('HH:mm');
    },
    csshash: () => sha1File(path.join(__dirname, '..', 'public', 'custom.css')),
    jshash: () => sha1File(path.join(__dirname, '..', 'public', 'custom.js'))
};

export function matchClan(name: string) {
    for (const i in tags) {
        const regex = new RegExp(tags[i], "i");

        if (regex.test(name)) {
            return {
                clan: i,
                name: regex.exec(name)![1]
            };
        }
    }
    
    return undefined;
}

export function stripClanTags(name: string) {
    const clan = matchClan(name);
    if (clan){
        return clan.name;
    } else {
        return name;
    }
}

export function stripFormating(name: string) {
    return name
    .replace(/\[c=[0-9a-f]{1}\]/i, '')
    .replace(/\[c=[0-9a-f]{3}\]/i, '')
    .replace(/\[c=[0-9a-f]{6}\]/i, '')
    .replace(/\[i\]/i, '')
    .replace(/\[u\]/i, '')
    .replace(/\[b\]/i, '');
}

export function removeSpaces(name: string) {
    for (let i = 0; i < 10; i++) {
        name = name.replace(/  /g, ' ')
        .replace(/^ /g, '')
        .replace(/ $/g, '');
    }

    return name;
}

export function cleanPlayerName(name: string) {
    name = name.toLocaleLowerCase();
    name = removeDiacritics(name)
    name = stripClanTags(name)
    name = stripFormating(name)
    name = name.replace(/[^a-z0-9\-\_]/ig, ' ');
    name = removeSpaces(name)

    return name.trim();
}
