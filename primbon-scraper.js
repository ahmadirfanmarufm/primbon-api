const axios = require("axios");
const cheerio = require("cheerio");
const request = require("request");

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(find, 'g'), replace);
}

function Tanggal(tanggal) {
    const tgl = tanggal.replace(/-.*/, "")
    const bln = tanggal.replace(/-([^-?]+)(?=(?:$|\?))/, "").replace(/.*?-/, "")
    const thn = tanggal.replace(/.*\-/, "")
    const result = {
        tanggal: tgl,
        bulan: bln,
        tahun: thn
    }
    return result
}

/**
 * @params Nama
 * @returns {String} Arti dari nama
 */
async function artiNama(nama) {
    return new Promise((resolve, reject) => {
        axios
            .get(
                `https://www.primbon.com/arti_nama.php?nama1=${nama}&proses=+Submit%21+`
            )
            .then(({
                data
            }) => {
                const $ = cheerio.load(data);
                const isi = $("#body").text().split("Nama:")[0];
                const result = isi
                .replace(/\n/gi, "")
                .replace("ARTI NAMA", "")
                .replace("                                ", "")
                .replace("     (adsbygoogle = window.adsbygoogle || []).push({});", "")
                .trim();
                resolve(result);
            })
            .catch(reject);
    });
};

/**
 * @params Kata kunci dari mimpi
 * @returns {String} Hasil pencarian dari kata kunci
 */
async function tafsirMimpi(mimpi) {
    return new Promise((resolve, reject) => {
        axios
            .get(
                `https://www.primbon.com/tafsir_mimpi.php?mimpi=${mimpi}&submit=+Submit+`
            )
            .then(({
                data
            }) => {
                const $ = cheerio.load(data);
                const cek = $("#body > font > i").text();
                const adaga = /Tidak ditemukan/g.test(cek) ? false : true;
                if (adaga) {
                    const isi = $("#body")
                        .text()
                        .split(`Hasil pencarian untuk kata kunci: ${mimpi}`)[1]
                        .replace(/\n\n\n\n\n\n\n\n\n/gi, "\n");
                    const result = isi.replace(/\n/gi, "")
                    .replace("       ", "").replace("\"        ", "")
                    .replace(/Solusi.*$/, "")
                    .trim();
                    const hasil = replaceAll(`${result}`, ".Mimpi", ".\nMimpi")
                    resolve(hasil)
                } else {
                    resolve(`Tidak ditemukan tafsir mimpi ${mimpi}. Cari dengan kata kunci yang lain..`);
                }
            })
            .catch(reject);
    });
};

/**
 * @params Nama anda
 * @params Nama pasangan
 * @returns {Promise<Object>} Nama anda, nama pasangan, sisi positif anda, sisi negatif anda, dan gambar love.
 */
async function Jodoh(nama1, nama2) {
    return new Promise((resolve, reject) => {
        axios
            .get(`https://www.primbon.com/kecocokan_nama_pasangan.php?nama1=${nama1}&nama2=${nama2}&proses=+Submit%21+`)
            .then(({
                data
            }) => {
                const $ = cheerio.load(data);
                const love = 'https://www.primbon.com/' + $('#body > img').attr('src');
                const res = $('#body').text().split(nama2)[1].replace('< Hitung Kembali', '').split('\n')[0];
                const positif = res.split('Sisi Negatif Anda: ')[0].replace('Sisi Positif Anda: ', '').trim();
                const negatifDanPenjelasan = res.split('Sisi Negatif Anda: ')[1].trim();

                const awalPenjelasanIndex = negatifDanPenjelasan.search(/Anda|Hubungan|Sementara itu|Karena itu|Apalagi|Namun|Jadi|Oleh karena itu|Tetapi/);
                
                let negatif, penjelasan;
                if (awalPenjelasanIndex !== -1) {
                    negatif = negatifDanPenjelasan.substring(0, awalPenjelasanIndex).trim();
                    penjelasan = negatifDanPenjelasan.substring(awalPenjelasanIndex).trim();
                } else {
                    negatif = negatifDanPenjelasan;
                    penjelasan = '';
                }

                const result = {
                    namaAnda: nama1,
                    namaPasangan: nama2,
                    positif: positif,
                    negatif: negatif,
                    penjelasan: penjelasan,
                    love: love
                };
                resolve(result);
            })
            .catch(reject);
    })
}

/**
 * @params tanggal jadian/pernikahan. contoh 1-2-2000
 * @returns {String} Hasil pencarian dari tanggal jadian/pernikahan.
 */
async function tanggaljadi(tanggal) {
    return new Promise((resolve, reject) => {
        const tgl = Tanggal(tanggal).tanggal
        const bln = Tanggal(tanggal).bulan
        const thn = Tanggal(tanggal).tahun
        axios
            .get(
                `https://www.primbon.com/tanggal_jadian_pernikahan.php?tgl=${tgl}&bln=${bln}&thn=${thn}&proses=+Submit%21+`
            )
            .then(({
                data
            }) => {
                const $ = cheerio.load(data);
                const result = $("#body").text()
                .replace("Karakteristik:", "\nKarakteristik:")
                .replace("Hubungan", "\nHubungan").replace(/^\s*\n/gm, "")
                .replace(/< Hitung Kembali.*$/s, "")
                .replace(/\(adsbygoogle = window.adsbygoogle \|\| \[\]\)\.push\(\{\}\);/g, '')
                .replace(/MAKNA TANGGAL JADIAN, PERNIKAHAN\n     \n/g, '')
                .replace(/(\s{2,})(?=\S)/g, ' ')
                .trim();
                resolve(result)
            })
            .catch(reject);
    });
};

/**
 * @params Nama mu
 * @params Tanggal lahir. contoh 1-1-2000
 * @params Nama pasangan
 * @params Tanggal lahir. contoh 1-1-2000
 * @returns {String} Hasil ramalan jodoh.
 */
async function ramalanjodoh(nama1, tanggal1, nama2, tanggal2) {
    return new Promise((resolve, reject) => {
        const tgl1 = Tanggal(tanggal1).tanggal
        const bln1 = Tanggal(tanggal1).bulan
        const thn1 = Tanggal(tanggal1).tahun
        const tgl2 = Tanggal(tanggal2).tanggal
        const bln2 = Tanggal(tanggal2).bulan
        const thn2 = Tanggal(tanggal2).tahun
        const options = {
            method: 'POST',
            url: 'https://primbon.com/ramalan_jodoh.php',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                nama1: nama1,
                tgl1: tgl1,
                bln1: bln1,
                thn1: thn1,
                nama2: nama2,
                tgl2: tgl2,
                bln2: bln2,
                thn2: thn2,
                submit: " RAMALAN JODOH &#62;&#62; "
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            const $ = cheerio.load(body);
            const result = $('#body').text()
            .replace(/^\s*\n/gm, "")
            .replace(nama1, `\n${nama1}`)
            .replace(/Tgl\. Lahir:/g, "\nTanggal Lahir:")
            .replace(nama2, `\n${nama2}`).replace("Dibawah", "\n\nDibawah")
            .replace(/1\. /g, "\n1. ").replace(/2\. /g, "\n2. ")
            .replace(/3\. /g, "\n3. ").replace(/4\. /g, "\n4. ")
            .replace(/5\. /g, "\n5. ").replace(/6\. /g, "\n6. ")
            .replace(/7\. /g, "\n7. ").replace(/8\. /g, "\n8. ")
            .replace(/9\. /g, "\n9. ").replace(/10\. /g, "\n10. ")
            .replace(/\*/s, "\n\n*").replace(/< Hitung Kembali.*$/s, "")
            .replace(/\(adsbygoogle = window.adsbygoogle \|\| \[\]\)\.push\(\{\}\);/g, '')
            .replace(/RAMALAN JODOH/g, '')
            .replace(/Konsultasi Hari Baik Akad Nikah >>>/g, '')
            .replace(/(\s{2,})(?=\S)/g, ' ')
            .trim();
            resolve(result)
        });
    })
}

/**
 * @params Tanggal lahir. contoh 1-1-2000
 * @returns {Promise<Object>} Penjelasan, dan gambar statistik.
 */
async function rejekiweton(tanggal) {
    return new Promise((resolve, reject) => {
        const tgl = Tanggal(tanggal).tanggal
        const bln = Tanggal(tanggal).bulan
        const thn = Tanggal(tanggal).tahun
        const options = {
            method: 'POST',
            url: 'https://primbon.com/rejeki_hoki_weton.php',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                tgl: tgl,
                bln: bln,
                thn: thn,
                submit: " Submit! "
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error)
            const $ = cheerio.load(body)
            const res = $('#body').text()
            .replace(/^\s*\n/gm, "")
            .replace("Hari Lahir:", "\nHari Lahir:")
            .replace("Seseorang", "\nSeseorang")
            .replace("Fluktuasi", "\n\nFluktuasi")
            .replace("Hover\n", "")
            .replace(/< Hitung Kembali.*$/s, "")
            .replace(/\(adsbygoogle = window.adsbygoogle \|\| \[\]\)\.push\(\{\}\);/g, '')
            .replace(/RAMALAN REJEKI \(HOKI\) MENURUT WETON JAWA[\s\S]*?Hari Lahir:/, '')
            .replace(/(\s{2,})(?=\S)/g, ' ')
            .trim();
            const stats = 'https://www.primbon.com/' + $('#body > span > img').attr('src')
            result = {
                penjelasan: "Menurut Weton Jawa, Hari Lahir: " + res,
                statistik: stats
            }
            resolve(result)
        });
    })
}

/**
 * @params Nama
 * @params Tanggal lahir. contoh 1-1-2000
 * @returns {String} Hasil kecocokan nama dengan tanggal lahir.
 */
async function kecocokannama(nama, tanggal) {
    return new Promise((resolve, reject) => {
        const tgl = Tanggal(tanggal).tanggal
        const bln = Tanggal(tanggal).bulan
        const thn = Tanggal(tanggal).tahun
        const options = {
            method: 'POST',
            url: 'https://primbon.com/kecocokan_nama.php',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                nama: nama,
                tgl: tgl,
                bln: bln,
                thn: thn,
                kirim: " Submit! "
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error)
            const $ = cheerio.load(body)
            const result = $('#body').text()
            .replace(/^\s*\n/gm, "")
            .replace("Tgl. Lahir:", "\nTanggal Lahir:")
            .replace(/< Hitung Kembali.*$/s, "")
            .replace(/\(adsbygoogle = window.adsbygoogle \|\| \[\]\)\.push\(\{\}\);/g, '')
            .replace(/KECOCOKAN NAMA DENGAN TANGGAL LAHIR/, '')
            .replace(/(\s{2,})(?=\S)/g, ' ')
            .trim();
            resolve("Kecocokan Nama Dengan " + result)
        });
    })
}

/**
 * @params Tanggal. contoh 1-1-2000
 * @returns {String} Hasil kecocokan nama dengan tanggal lahir.
 */
async function haribaik(tanggal) {
    return new Promise((resolve, reject) => {
        const tgl = Tanggal(tanggal).tanggal
        const bln = Tanggal(tanggal).bulan
        const thn = Tanggal(tanggal).tahun
        const options = {
            method: 'POST',
            url: 'https://primbon.com/petung_hari_baik.php',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                tgl: tgl,
                bln: bln,
                thn: thn,
                submit: " Submit! "
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error)
            const $ = cheerio.load(body)
            const result = $('#body').text()
            .replace(/^\s*\n/gm, "").replace("Watak", "\nWatak")
            .replace("Kamarokam", "Kamarokam\n").replace(thn, `${thn}\n`)
            .replace(/< Hitung Kembali.*$/s, "")
            .replace(/PETUNG HARI BAIK \(KAMAROKAM\)/, '')
            .replace(/\(adsbygoogle = window.adsbygoogle \|\| \[\]\)\.push\(\{\}\);/g, '')
            .replace(/(\s{2,})(?=\S)/g, ' ')
            .trim();
            resolve("Petung Hari Baik (Kamarokam) " + result)
        });
    })
}

/**
 * @params Tanggal. contoh 1-1-2000
 * @returns {String} Hasil kecocokan nama dengan tanggal lahir.
 */
async function harilarangan(tanggal) {
    return new Promise((resolve, reject) => {
        const tgl = Tanggal(tanggal).tanggal
        const bln = Tanggal(tanggal).bulan
        const thn = Tanggal(tanggal).tahun
        const options = {
            method: 'POST',
            url: 'https://primbon.com/hari_sangar_taliwangke.php',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                tgl: tgl,
                bln: bln,
                thn: thn,
                kirim: " Submit! "
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error)
            const $ = cheerio.load(body)
            const result = $('#body').text()
            .replace(/^\s*\n/gm, "")
            .replace(tgl, `\n${tgl}`).replace("Termasuk", "\nTermasuk")
            .replace(/Untuk mengetahui.*$/s, "")
            .replace(/\n\s*\(adsbygoogle = window\.adsbygoogle \|\| \[\]\)\.push\(\{\}\);\n/g, '')
            .replace(/(\s{2,})(?=\S)/g, ' ')
            .trim();
            resolve(result)
        });
    })
}

/**
 * @params Tanggal lahir. contoh 1-1-2000
 * @returns {String} Hasil Horoskop.
 */
async function horoskop(tanggal) {
    return new Promise((resolve, reject) => {
        const tgl = Tanggal(tanggal).tanggal;
        const bln = Tanggal(tanggal).bulan;
        const thn = Tanggal(tanggal).tahun;
        const options = {
            method: 'POST',
            url: 'https://www.primbon.com/horoskop.php',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                tgl: tgl,
                bln: bln,
                thn: thn,
                submit: "Submit"
            }
        };

        request(options, function (error, response, body) {
            if (error) {
                reject(error);
            } else {
                const $ = cheerio.load(body);
                let fullText = $('#body').text();

                const wetonKeyword = "1. Weton anda adalah";
                let wetonIndex = fullText.indexOf(wetonKeyword);
                let wetonText = "";
                if (wetonIndex !== -1) {
                    wetonIndex += wetonKeyword.length;
                    let wetonEndIndex = fullText.indexOf(".", wetonIndex);
                    if (wetonEndIndex !== -1) {
                        wetonText = fullText.substring(wetonIndex, wetonEndIndex).trim();
                    }
                }

                const startKeyword = "Sifat/karakter orang yang lahir pada Weton tersebut, adalah:";
                const endKeyword = "2. ";
                
                let startIndex = fullText.indexOf(startKeyword);
                let characterText = "";
                if (startIndex !== -1) {
                    startIndex += startKeyword.length;
                    let endIndex = fullText.indexOf(endKeyword, startIndex);
                    if (endIndex !== -1) {
                        characterText = `Weton kamu adalah ${wetonText}. Sifat atau karakter orang yang lahir pada ${wetonText} adalah ${fullText.substring(startIndex, endIndex).trim()}`;
                    }
                }

                resolve(characterText);
            }
        });
    });
}


module.exports = {
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
}