import React, {Component} from 'react';
import Particle from 'particle-api-js';
import Autocomplete from 'react-autocomplete';
import Plot from 'react-plotly.js';

import './App.css';
import {particleToken} from './particle-key';


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
        fetch('https://us-central1-weather-clock-200715.cloudfunctions.net/findLocation?search=' + query, {mode: "cors"})
            .then((result) => {
                result.json().then(data => {
                    that.setState({result: data.slice(0, 10)});
                });
            });
        this.setState({query});
    };

    onSelect = (locationName) => {
        this.setState({query: locationName});
        const r = this.state.result.find(e => e.navn === locationName);
        this.props.setLocation(r.url);
    };

    render() {
        return (
            <Autocomplete
                getItemValue={(item) => item.navn}
                items={this.state.result}
                renderItem={(item, isHighlighted) =>
                    <div style={{background: isHighlighted ? 'lightgray' : 'black'}}>
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

function unpack(rows, key) {
    return rows.map(function (row) {
        return row[key];
    });
}

class TempLog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tempLog: [],
        }
    }

    componentDidMount() {
        const that = this;
        fetch(`https://us-central1-weather-clock-200715.cloudfunctions.net/getTempLog?deviceId=${this.props.deviceId}&limit=500`, {mode: "cors"})
            .then(result => {
                result.json().then(data => {
                    that.setState({tempLog: data});
                })
            });
    }

    render() {
        return (
            <div>
                {this.state.tempLog.length > 0 && <Plot
                    data={[
                        {
                            x: unpack(this.state.tempLog, 'timestamp'),
                            y: unpack(this.state.tempLog, 'temp'),
                            type: 'scatter',
                            mode: 'lines+points',
                            name: 'temp',
                            marker: {color: 'red'},
                        },
                        {
                            x: unpack(this.state.tempLog, 'timestamp'),
                            y: unpack(this.state.tempLog, 'humidity'),
                            type: 'scatter',
                            mode: 'lines+points',
                            name: 'humidity',
                            marker: {color: 'blue'},
                        },
                        {
                            x: unpack(this.state.tempLog, 'timestamp'),
                            y: this.state.tempLog.map(d => d.weatherData.temp),
                            type: 'scatter',
                            mode: 'lines+points',
                            name: 'outsideTemp',
                            marker: {color: 'pink'},
                        },
                        //{type: 'scatter', x: [1, 2, 3], y: [2, 5, 3]},
                    ]}
                    layout={{width: "100%", height: 240, title: 'A Fancy Plot'}}
                />}
            </div>
        )
    }
}

class Device extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentWeather: {}
        };

        this.setLocation = this.setLocation.bind(this);
    }

    componentDidMount() {
        const that = this;
        fetch('https://us-central1-weather-clock-200715.cloudfunctions.net/getYrData?coreid=' + this.props.device.id, {mode: "cors"})
            .then((result) => {
                result.json().then(data => {
                    that.setState({ currentWeather: data });
                });
            });
    }

    pingDevice = () => {
        particle.callFunction({deviceId: this.props.device.id, name: 'ping', auth: token});
    };

    initDevice = () => {
        particle.callFunction({deviceId: this.props.device.id, name: 'rerunInit', auth: token})
    };

    initFetchWeather = () => {
        particle.callFunction({deviceId: this.props.device.id, name: 'getWeather', auth: token})
    };

    signalDevice = () => {
        const deviceId = this.props.device.id;
        particle.signalDevice({deviceId: deviceId, signal: true, auth: token}).then(function (data) {
            setTimeout(() => {
                particle.signalDevice({deviceId: deviceId, signal: false, auth: token})
            }, 3000);
        }, function (err) {
            console.log('Error sending a signal to the device:', err);
        })
    };

    setLocation = (locationUrl) => {
        const that = this;
        fetch(`https://us-central1-weather-clock-200715.cloudfunctions.net/setLocation?location=${locationUrl}&deviceId=${this.props.device.id}`, {mode: "cors"})
            .then(result => {
                result.json().then(currentWeather => {
                    that.setState({ currentWeather });
                })
            })
    };

    renderWeather(weather) {
        if (!weather.location) {
            return null;
        }

        return (
            <div className="particle-weather">
                <div className="particle-weather--location">{weather.location}</div>
                <div className="particle-weather--data">{weather.text} {weather.temp} &#x2103;</div>
            </div>
        );
    }

    render() {
        const d = this.props.device;

        return (
            <div className="particle">
                <h1 className="particle-header">{d.name}</h1>
                {this.renderWeather(this.state.currentWeather)}
                <br/>
                <div>
                    <SearchField setLocation={this.setLocation}/>
                </div>
                <br/>
                {/*<TempLog deviceId={d.id}/>*/}
                <button onClick={this.pingDevice}>Ping</button>
                <button onClick={this.initDevice}>Init</button>
                <button onClick={this.initFetchWeather}>Get weather</button>
                <button onClick={this.signalDevice}>Signal</button>
                <br/>
                <div style={{color: d.connected ? 'green' : 'red'}}>{d.id}</div>
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
        fetch('https://us-central1-weather-clock-200715.cloudfunctions.net/getAllParticles', {mode: "cors"}).then(res => {
            this.setState({registeredDevises: res.body});
        });
        particle.listDevices({auth: token}).then(res => this.setState({devices: res.body}));
    }

    render() {
        return (
            <div className="App">
                <div className="particle-container">
                    {this.state.devices.map(d => {
                        return (
                            <div key={d.id}>
                                <Device device={d}/>
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
