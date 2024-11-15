import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link , useNavigate} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, useMapEvents} from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

import Modal from './Modal'

//import { ToastContainer, toast } from 'react-toastify'; 
//import 'react-toastify/dist/ReactToastify.css';

import api from '../../services/api'

import './style.css';
import logo from '../../assets/logo.svg'



interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string
}


const CreatePoint: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    

    const [, setInitialPosition] = useState<[number, number]>([0, 0]);

    const [formData, setFormData] = useState({
        name:'',
        email:'',
        whatsapp: '',
    });

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const[selectedItems, setSelectItems] = useState<number[]>([]);

    const [modalOpen, setModalOpen] = useState(false);

    const navigate = useNavigate();
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            setInitialPosition([latitude,longitude])
        })
    }, []);
    
    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        })
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('http://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);

            setUfs(ufInitials);
        });
    }, []);

    useEffect(() => {
        if (selectedUf === '0') {
            return;
        }

        axios.get<IBGECityResponse[]>(`http://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {           
            const cityNames = response.data.map(city => city.nome);

            setCities(cityNames);
        });
    }, [selectedUf]);

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
       const city = event.target.value;

       setSelectedCity(city);
    }

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
 
        setSelectedUf(uf);
     }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value} = event.target
        setFormData({ ...formData, [name]: value})
    }

    function handleSelectItem(id:number) {
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);

            setSelectItems(filteredItems);
        }else {
            setSelectItems([...selectedItems, id]); 
        }               
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        };

       await api.post('points', data);

       setModalOpen(true);
       setTimeout(() => {
            setModalOpen(false);
            navigate('/');
       }, 3000);
     
    };

    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const MapClickHandler = () => { 
        useMapEvents({ 
            click(event) { setSelectedPosition([event.latlng.lat, event.latlng.lng]);                 
            }, 
        }); 
        return null; 
    };

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text" 
                            name="name" 
                            id="name" 
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text" 
                                name="whatsapp" 
                                id="whatsapp" 
                                onChange={handleInputChange}
                                required
                            />
                        </div>                        

                    </div>

                    
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    
                    <MapContainer center={[-23.55052, -46.633308]/*initialPosition*/} zoom={13} style={{ height: '300px', width: '100%' }} > 
                        <TileLayer 
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors' 
                        /> 
                        <Marker position={selectedPosition} /> 
                        <MapClickHandler /> 
                    </MapContainer>

                  

                

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado-UF</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectedUf} 
                                onChange={handleSelectUf}
                                required                                
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectCity}
                                required
                            >
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                   <ul className="items-grid">
                        {items.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                              <img src={item.image_url} alt={item.title} />
                              <span>{item.title}</span>
                            </li>
                        ))}
                      

                        

                   </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
            <Modal
                isOpen={modalOpen}
                message="Cadastro efetuado!"
                onClose={() => setModalOpen(false)}
            />
        </div>

    );
};

export default CreatePoint;
