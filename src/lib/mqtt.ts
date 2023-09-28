import { connect } from "mqtt";

const client = connect("ws://192.168.1.6:9001");

const shouldConnect = () => {
  client.on("connect", () => {
    console.log("MQTT Connected");
  });
  client.on("error", (error) => {
    console.log("MQTT Error", error);
    client.reconnect();
  });
};

const turnOff = (deviceId: string) => {
  client.publish("iot/meja", `meja${deviceId}_off`);
};

const turnOn = (deviceId: string) => {
  client.publish("iot/meja", `meja${deviceId}_on`);
};

export { client, shouldConnect, turnOff, turnOn };
