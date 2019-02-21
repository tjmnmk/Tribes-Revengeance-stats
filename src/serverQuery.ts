import * as http from "http";
import * as https from "https";
import * as dgram from "dgram";
import * as net from "net";
import * as winston from "winston";
import axios from 'axios';
import { ITribesServerQueryResponse } from "./types";
import { Server } from "./db";

const timeoutMs = 1000;
const masterClient = axios.create({
  timeout: 1000,
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

export async function getTribesServersFromMasterServer(): Promise<{ ip: string, port: number }[]> {
  const resp = await masterClient.get<string>("http://qtracker.com/server_list_details.php?game=tribesvengeance");
  var lines = resp.data.split("\r\n");
  var servers = lines
  .map(function (item) {
    const splat = item.split(":");
    return {
      ip: splat[0],
      port: parseInt(splat[1])
    }
  })
  .filter(s => s.ip && s.port);

  return servers;
}

export async function getTribesServersFromDb() {
  const servers = await Server.find().select({ ip: 1, port: 1 }).exec();
  return servers.filter(x => x.ip && x.port).map(x => ({ ip: x.ip, port: x.port }));
}

export function parseTribesServerQueryReponse(ip: string, port: number, message: string, ping: number): ITribesServerQueryResponse {
  var items = message.split('\\');
  items.splice(0, 1);
  var dict = {};
  var name = true;
  var lastName = "";

  items.forEach(function (item) {
    if (name) lastName = item;
    else dict[lastName] = item;
    name = !name;
  });

  var data: Partial<ITribesServerQueryResponse> = {
    ip,
    ping,
    players: []
  };

  for (var n in dict) {
    if (n.indexOf("_") !== -1) {
      var splat = n.split("_");
      var itemName = splat[0];
      var index = splat[1];

      if (data.players![index] === undefined) data.players![index] = {};
      data.players![index][itemName] = dict[n];
    }
    else data[n] = dict[n];
  }

  data.ip = ip;
  data.ping = ping;

  return data as ITribesServerQueryResponse;
}

export function queryTribesServer(ip: string, port: number, callback: (data: ITribesServerQueryResponse) => any) {
  var message = new Buffer('\\basic\\');
  var client = dgram.createSocket('udp4');
  var timer = setTimeout(function () {
    closeAll();
    winston.info('Timeout on ' + ip + ":" + port);

  }, timeoutMs);

  var start = new Date().getTime();

  client.on('listening', function () {
    //console.log('Listening on ' + ip + ":" + port);
  });

  client.on('message', function (message, remote) {
    //console.log("Response from",ip + ':' + port)
    closeAll();
    var end = new Date().getTime();
    var time = end - start;
    let parsed = parseTribesServerQueryReponse(ip, port, message.toString('utf8'), time);
    callback(parsed);
  });

  var closeAll = function () {
    clearTimeout(timer);
    client.close();
  };

  client.send(message, 0, message.length, port, ip);
  //client.bind(ip, port);
}
