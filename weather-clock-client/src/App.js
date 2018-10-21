import React, { Component } from 'react';
import Particle from 'particle-api-js';

import './App.css';
import { particleToken } from './particle-key';


const particle = new Particle();
const token = particleToken;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            devices: [],
        }
    }
    componentWillMount() {
        particle.listDevices({ auth: token }).then(res => this.setState({ devices: res.body }));
    }

    render() {
    return (
      <div className="App">
        <header className="App-header">
          Weather clock client
        </header>
        <div>
            {this.state.devices.map(d => {
                console.log(d);
                return (
                    <div  key={d.id}>
                        <div style={{ color: d.connected ? 'green' : 'red'}}>{d.name} - {d.id}</div>
                        <button onClick={() => { particle.callFunction({deviceId: d.id, name: 'ping', auth: token })}}>Ping</button>
                        <button onClick={() => { particle.callFunction({deviceId: d.id, name: 'rerunInit', auth: token })}}>Init</button>
                        <button onClick={() => { particle.callFunction({deviceId: d.id, name: 'getWeather', auth: token })}}>Get weather</button>
                        <button onClick={() => {
                            particle.signalDevice({ deviceId: d.id, signal: true, auth: token }).then(function(data) {
                                console.log('Device is shouting rainbows:', data);
                                setTimeout(() => {
                                    particle.signalDevice({ deviceId: d.id, signal: false, auth: token })
                                }, 3000);
                            }, function(err) {
                                console.log('Error sending a signal to the device:', err);
                            });
                        }}>Signal</button>
                    </div>
                );
            })
            }
        </div>
      </div>
    );
  }
}

export default App;
