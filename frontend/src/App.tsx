import React, {useEffect, useState} from 'react';

function App() {
    const [backendData, setBackendData] = useState([{
        name: String, price: Number


    }])

    useEffect(() => {
        fetch('http://localhost:7000/data').then((response) => {
            response.json().then((data) => {
                setBackendData(data)
            })
        })
    }, [])
    return (
        <div>
            {(typeof backendData[0].name === 'undefined') ? (
                <p>Loading...</p>
            ) : (
                backendData.map((item) => (
                    <p>{'Name: '+item.name.toString()+'\nPrice: '+item.price.toString()+'CZK'}</p>
                ))
            )}
        </div>
    );
}

export default App;
