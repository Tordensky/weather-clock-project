import React, { Component } from 'react';
import Particle from 'particle-api-js';
import Autocomplete from 'react-autocomplete';

import './App.css';
import { particleToken } from './particle-key';


const particle = new Particle();
const token = particleToken;


class SearchField extends Component {
    constructor(props) {
        super(props);

        this.state = {
            query: '',
            result: [],
        };
    }

    onChange = (e) => {
        let query = e.target.value;
        const that = this;
        fetch('https://us-central1-weather-clock-200715.cloudfunctions.net/findLocation?search=' + query, { mode: "cors" })
            .then((result) => {
                result.json().then(data => {
                    that.setState({ result: data.slice(0, 10) });
                    console.log(data)
                });
            });
        this.setState({ query });
    };

    onSelect = (locationName) => {
        this.setState({ query: locationName });
        const r = this.state.result.find(e => e.navn === locationName);
        this.props.setLocation(r.url);
        console.log(locationName, r.url);
    };

    render() {
        return (
            <Autocomplete
                getItemValue={(item) => item.navn}
                items={this.state.result}
                renderItem={(item, isHighlighted) =>
                    <div style={{ background: isHighlighted ? 'lightgray' : 'black' }}>
                        {item.navn}
                    </div>
                }
                value={this.state.query}
                onChange={this.onChange}
                onSelect={this.onSelect}
            />
        )
    }
}

class Device extends Component {
    pingDevice = () => {
        particle.callFunction({deviceId: this.props.device.id, name: 'ping', auth: token });
    };

    initDevice = () => {
        particle.callFunction({deviceId: this.props.device.id, name: 'rerunInit', auth: token })
    };

    initFetchWeather = () => {
        particle.callFunction({deviceId: this.props.device.id, name: 'getWeather', auth: token })
    };

    signalDevice = () => {
        const deviceId = this.props.device.id;
        particle.signalDevice({ deviceId: deviceId, signal: true, auth: token }).then(function(data) {
            setTimeout(() => {
                particle.signalDevice({ deviceId: deviceId, signal: false, auth: token })
            }, 3000);
        }, function(err) {
            console.log('Error sending a signal to the device:', err);
        })
    };

    setLocation = (locationUrl) => {
        fetch(`https://us-central1-weather-clock-200715.cloudfunctions.net/setLocation?location=${locationUrl}&deviceId=${this.props.device.id}`)
    };

    render() {
        const d = this.props.device;

        return (
            <div className="particle">
                <SearchField setLocation={this.setLocation}/>
                <div style={{ color: d.connected ? 'green' : 'red'}}>{d.name} - {d.id}</div>
                <button onClick={this.pingDevice}>Ping</button>
                <button onClick={this.initDevice}>Init</button>
                <button onClick={this.initFetchWeather}>Get weather</button>
                <button onClick={this.signalDevice}>Signal</button>
            </div>
        )
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            devices: [],
        }
    }
    componentWillMount() {
        fetch('https://us-central1-weather-clock-200715.cloudfunctions.net/getAllParticles').then(res => {
            this.setState({ registeredDevises: res.body });
        });


        particle.listDevices({ auth: token }).then(res => this.setState({ devices: res.body }));
    }

    render() {
    return (
      <div className="App">
        <header className="App-header">
          Weather clock client
        </header>
        <div className="particle-container">
            {this.state.devices.map(d => {
                console.log(d);
                return (
                    <div  key={d.id}>
                        <Device device={d} />


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
