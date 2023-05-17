const User = require('../models/user')
const File = require('../models/files')
const xlsx = require('xlsx')

const listFiles = async (req, res) => {
    try {
        console.log("PARAMS: ", req.query.id)
        const id_user = req.query.id
        const arrayFileDB = await File.find({
            id_user: id_user
        });
        return res.status(200).json(arrayFileDB);

    } catch (error) {
        console.log(error)
    }
}


const downloadFile = async (req, res) => {
    try {
        let data = req.query;
        console.log("DATA FILE: ", data)

        const file_search = await File.findOne({
            _id: data.id
        })

        console.log("FILE: ", file_search)

        // const CURRENT_DIR = join(__dirname,'../uploads')
        // console.log("DIREC: ", CURRENT_DIR)


        res.download(file_search.ubicacion);
        // const user = await User.findOne({
        //     rut: data.rut,
        // })

        // if (user) {
        //     fs.access(img, fs.constants.F_OK, err => {
        //         console.log(`${img} ${err ? 'No existe' : 'existe'}`)
        //     })

        //     fs.readFile(img, (err, content) => {
        //         if (err) {
        //             res.writeHead(404, { 'Content-type': 'text/html' })
        //             res.end('<h1>No such image</h1>')
        //         } else {
        //             res.writeHead(200, { 'Content-type': 'image/jpg' })
        //             res.end(content)
        //         }
        //     })
        // }
    } catch (error) {
        console.log(error)
    }
}


const deleteFile = async (req, res) => {
    try {
        let data = req.body;
        console.log("FILE DELETE: ", data)
        const file_search = await File.findOne({
            _id: data.id
        })

        if (file_search) {
            file_search.remove()
            let obj = {
                success: true,
                _id: file_search._id
            }
            res.send(obj)
            res.end();
        }

    } catch (error) {
        console.log(error)
    }
}


const importExcel = (req, res) => {
    console.log("/////////    begin Import pagos masivos   /////////");
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Define un array para almacenar los objetos
        const datosColumnas = [];
        // Inicializa la variable de número de propiedad
        let numPropiedad = 1;

        // Obtiene el rango de celdas de la hoja
        const ref = sheet['!ref'];
        const [inicio, fin] = ref.split(':');
        const { c: colInicio, r: filaInicio } = xlsx.utils.decode_cell(inicio);
        const { c: colFin, r: filaFin } = xlsx.utils.decode_cell(fin);

        // Itera sobre todas las columnas de la hoja y almacena los datos en el array de objetos
        for (let j = colInicio; j <= colFin; j++) {
            const columna = xlsx.utils.encode_col(j);
            let tieneValores = false;
            const datosColumna = {};

            // Itera sobre las filas de la columna y almacena los datos en el objeto
            for (let i = filaInicio + 1; i <= filaFin; i++) {
                const celda = columna + i;
                const valorCelda = sheet[celda] ? sheet[celda].v : null;
                if (valorCelda !== null) {
                    datosColumna['n' + numPropiedad] = valorCelda;
                    tieneValores = true;
                    numPropiedad++;
                }
            }

            // Si la columna tiene al menos un valor, almacena el objeto en el array
            if (tieneValores) {
                datosColumnas.push(datosColumna);
            }

            // Reinicia el número de propiedad para la siguiente columna
            numPropiedad = 1;
        }

        // Imprime el array de objetos
        console.log(JSON.stringify(datosColumnas));



        //console.log("DATA EXCEL: ", objNum)


        // var spreadsheet = xlsx.parse(req.files.upload.attachment.path);
        // var data = spreadsheet.worksheets[0].data;
        // const maxCol = spreadsheet.worksheets[0].maxCol;
        // let totalRows = spreadsheet.worksheets[0].maxRow--;
        // var items = {
        //     total: totalRows,
        //     separate: req.body.separate,
        //     sid: req.body.sid
        // };
        // let index = 0;
        // let dt = []
        // const setList = (dt_e_e) => {

        //     rest.post(`${hostname}/4DACTION/_force_setPagoMasivo`, {
        //         data: dt_e_e.pop()
        //     }).on('success', (data) => {
        //         if (dt.length > 0) {
        //             setList(dt_e_e);
        //         } else {
        //             console.log('------ Pagos masivos realizado! --------');
        //             res.send(JSON.parse(data));
        //         }
        //     }).on('fail', (error) => {

        //         console.log('------ ERROR EN CARGA DE LISTADO --------');
        //         console.log(error);
        //         res.end(error);
        //     });

        // }

        // data = data.filter(Boolean); //Limpiar el array de indefinidos

        // console.log("DATA EXCEL: ", data)
        // for (let i = 1; i < data.length; i++) {
        //     //console.log('PARTE1: ', data[i][0].value)
        //     let folio = String(data[i][0].value);
        //     let folio_dtc = String(data[i][1].value);
        //     //['Folio gasto (OC ó FXR)', 'Folio DTC', 'Total pago', 'Tipo pago', 'Nro Operación', 'Fecha', 'Descripcion', 'Nombre banco', 'Numero cuenta', 'Razon social **', 'Rut (ID proveedor) **']
        //     let tipo = folio_dtc !== '' && folio_dtc !== 'NaN' ? 'dtc' : 'oc'
        //     let objeto = {
        //         tipo: tipo,
        //         folio_gasto: tipo === 'oc' ? '0' + folio : folio,
        //         folio_dtc: folio_dtc,
        //         total_pago: data[i][2].value,
        //         tipo_pago: data[i][3].value,
        //         nro_operacion: data[i][4].value,
        //         fecha: data[i][5].value,
        //         descripcion: data[i][6].value,
        //         nombre_banco: data[i][7].value,
        //         nro_cuenta: data[i][8].value,
        //         razon_social: data[i][9].value,
        //         rut_proveedor: data[i][10].value
        //     };

        //     dt.push(objeto);
        // }

        // console.log('DATA A CARGAR: ', dt)

        //setList(dt);

    } catch (error) {
        console.log("**** ERROR **** " + error)
        res.send(error)
    }


}

module.exports = {
    listFiles,
    downloadFile,
    deleteFile,
    importExcel
}