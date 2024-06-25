const express = require('express');
const bodyParser = require('body-parser');
const {
    artiNama,
    tafsirMimpi,
    Jodoh,
    tanggaljadi,
    ramalanjodoh,
    rejekiweton,
    kecocokannama,
    haribaik,
    harilarangan,
    horoskop
} = require('./primbon-scraper'); 

const app = express();
const PORT = 8888;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('API berhasil berjalan');
});

// Endpoint untuk mendapatkan arti nama
app.get('/api/arti-nama/:nama', async (req, res) => {
    const { nama } = req.params;
    try {
        const result = await artiNama(nama);
        res.json({ artiNama: result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk tafsir mimpi
app.get('/api/tafsir-mimpi/:mimpi', async (req, res) => {
    const { mimpi } = req.params;
    try {
        const result = await tafsirMimpi(mimpi);
        res.json({ tafsirMimpi: result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk mencari kecocokan nama pasangan
app.get('/api/jodoh/:nama1/:nama2', async (req, res) => {
    const { nama1, nama2 } = req.params;
    try {
        const result = await Jodoh(nama1, nama2);
        res.json({ jodoh: result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk tanggal jadian/pernikahan
app.get('/api/tanggal-jadi/:tanggal', async (req, res) => {
    const { tanggal } = req.params;
    try {
        let result = await tanggaljadi(tanggal);
        res.json({ tanggalJadi: result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk Ramalan Jodoh
app.get('/api/ramalan-jodoh/:nama1/:tanggal1/:nama2/:tanggal2', async (req, res) => {
    const { nama1, tanggal1, nama2, tanggal2 } = req.params;
    try {
        let result = await ramalanjodoh(nama1, tanggal1, nama2, tanggal2);
        res.json({ ramalanJodoh: result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk Ramalan Rezeki Weton
app.get('/api/rejeki-weton/:tanggal', async (req, res) => {
    const { tanggal } = req.params;
    try {
        let result = await rejekiweton(tanggal);
        res.json({ rejekiWeton: result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk Kecocokan Nama
app.get('/api/kecocokan-nama/:nama/:tanggal', async (req, res) => {
    const { nama, tanggal } = req.params;
    try {
        let result = await kecocokannama(nama, tanggal);
        res.json({ kecocokanNama: result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Endpoint untuk Hari Baik
app.get('/api/hari-baik/:tanggal', async (req, res) => {
    const { tanggal } = req.params;
    try {
        let result = await haribaik(tanggal);
        res.json({ hariBaik: result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk Hari Larangan
app.get('/api/hari-larangan/:tanggal', async (req, res) => {
    const { tanggal } = req.params;
    try {
        let result = await harilarangan(tanggal);
        res.json({ hariLarangan: result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk Horoskop
app.get('/api/horoskop/:tanggal', async (req, res) => {
    const { tanggal } = req.params;
    try {
        let result = await horoskop(tanggal);
        res.json({ horoskop: result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});