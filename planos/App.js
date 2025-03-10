"use client"

import { useState, useEffect, useRef } from "react"
import { FaTimes, FaPlus, FaDownload, FaUpload, FaSearch, FaSearchPlus, FaSearchMinus, FaUndo } from "react-icons/fa"
import * as XLSX from "xlsx"
import "./styles.css"

const API_URL = "http://127.0.0.1:8000/api/"

const PISOS = [
  { value: "PISO1", label: "Piso 1" },
  { value: "PISO2", label: "Piso 2" },
  { value: "PISO3", label: "Piso 3" },
  { value: "PISO4", label: "Piso 4" },
  { value: "TORRE1", label: "Torre 1" },
]

const COLORES = [
  { value: "#222270", label: "SIMYO" },
  { value: "#00FF00", label: "Simyo Televenta" },
  { value: "#FF66B2", label: "Simyo Cancelación Portabilidad" },
  { value: "#FFD700", label: "amarillo claro" },
  { value: "#808000", label: "Credivalores" },
  { value: "#864fbd", label: "Segur Caixa Cuadro Medico" },
  { value: "#b47f30", label: "Caixa Citas Medicas" },
  { value: "#df91b8", label: "Eurona" },
  { value: "#f42ff2", label: "JELPIT" },
  { value: "#00a3ff", label: "Seguros Bolivar Desborde SOAT Cotizaciones" },
  { value: "#7fcb51", label: "Endesa Competitivas" },
  { value: "#4cb7f4", label: "Credifinanciera" },
  { value: "#8B0000", label: "Finetwork" },
  { value: "#22229f", label: "TELEPIZZA ESPAÑA (CONTRAJORNADA CON SIMYO)" },
  { value: "#449214", label: "Endesa Agencia Digital" },
  { value: "#FF0000", label: "DAVIVIENDA_TELEVENTAS_TMK" },
  { value: "#df6363", label: "Linea Soporte" },
  { value: "#B0BEC5", label: "Practicantes Desarrollo" },
  { value: "#ff8900", label: "naranja" },
  { value: "#ffffff", label: "default" },
]

const ESTADOS = [
  { value: "disponible", label: "Disponible", color: "green" },
  { value: "ocupado", label: "Ocupado", color: "red" },
  { value: "reservado", label: "Reservado", color: "orange" },
  { value: "inactivo", label: "Inactivo", color: "gray" },
]

// Helper function to determine text color based on background
const getContrastColor = (hexcolor) => {
  // Remove the # if present
  const hex = hexcolor.replace("#", "")

  // Convert to RGB
  const r = Number.parseInt(hex.substr(0, 2), 16)
  const g = Number.parseInt(hex.substr(2, 2), 16)
  const b = Number.parseInt(hex.substr(4, 2), 16)

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? "#000000" : "#ffffff"
}

const FloorPlan = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [positions, setPositions] = useState({})
  const [rows, setRows] = useState(51)
  const [columns, setColumns] = useState([
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "AA",
    "AB",
    "AC",
    "AD",
    "AE",
    "AF",
    "AG",
    "AH",
    "AI",
    "AJ",
    "AK",
    "AL",
    "AM",
    "AN",
    "AO",
    "AP",
    "AQ",
    "AR",
    "AS",
    "AT",
    "AU",
    "AV",
    "AW",
    "AX",
    "AY",
    "AZ",
    "BA",
    "BB",
    "BC",
    "BD",
    "BE",
    "BF",
    "BG",
    "BH",
    "BI",
    "BJ",
    "BK",
    "BL",
    "BM",
    "BN",
    "BO",
    "BP",
    "BQ",
    "BR",
    "BS",
    "BT",
    "BU",
    "BV",
    "BW",
  ])
  const [newPosition, setNewPosition] = useState({
    id: "",
    nombre: "",
    tipo: "",
    estado: "disponible",
    detalles: "",
    fila: 1,
    columna: "A",
    color: "#B0BEC5",
    piso: "PISO1",
    sede: "",
    servicio: "",
    dispositivos: "",
    mergedCells: [], // Array of cells included in the merged area
  })
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedPiso, setSelectedPiso] = useState("PISO1")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectionStart, setSelectionStart] = useState(null)
  const [selectionEnd, setSelectionEnd] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const tableContainerRef = useRef(null)

  useEffect(() => {
    fetchPositions()
  }, [])

  const fetchPositions = async () => {
    try {
      const response = await fetch(`${API_URL}posiciones/`)
      const data = await response.json()
      console.log("Datos recibidos del backend:", data)
      setPositions(data.reduce((acc, pos) => ({ ...acc, [pos.id]: pos }), {}))
    } catch (error) {
      console.error("Error al obtener posiciones:", error)
    }
  }

  const savePosition = async () => {
    try {
      console.log("Datos a enviar:", newPosition)
      const method = positions[newPosition.id] ? "PUT" : "POST"
      const url = positions[newPosition.id] ? `${API_URL}posiciones/${newPosition.id}/` : `${API_URL}posiciones/`

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPosition),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error en la solicitud:", errorData)
        throw new Error(`Error en la solicitud: ${response.status}`)
      }

      console.log("Guardado correctamente.")
      fetchPositions()
      setIsModalOpen(false)
      clearSelection()
    } catch (error) {
      console.error("Error al guardar posición:", error)
    }
  }

  const deletePosition = async (id) => {
    try {
      if (!id) {
        console.error("Error: No se puede eliminar una posición sin ID.")
        return
      }

      console.log(`Intentando eliminar posición con ID: ${id}`)

      const checkResponse = await fetch(`${API_URL}posiciones/${id}/`)
      if (!checkResponse.ok) {
        console.error("Error: La posición no existe en el backend.")
        return
      }

      const response = await fetch(`${API_URL}posiciones/${id}/`, { method: "DELETE" })

      if (!response.ok) {
        throw new Error(`Error en la eliminación: ${response.status}`)
      }

      console.log("Posición eliminada correctamente.")
      fetchPositions()
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error al eliminar posición:", error)
    }
  }

  const handleCellMouseDown = (row, col) => {
    setIsSelecting(true)
    setSelectionStart({ row, col })
    setSelectionEnd({ row, col })
  }

  const handleCellMouseEnter = (row, col) => {
    if (isSelecting) {
      setSelectionEnd({ row, col })
    }
  }

  const handleCellMouseUp = () => {
    if (isSelecting) {
      handleCreatePosition()
    }
    setIsSelecting(false)
  }

  const clearSelection = () => {
    setSelectionStart(null)
    setSelectionEnd(null)
    setIsSelecting(false)
  }

  const getSelectedCells = () => {
    if (!selectionStart || !selectionEnd) return []

    const startRow = Math.min(selectionStart.row, selectionEnd.row)
    const endRow = Math.max(selectionStart.row, selectionEnd.row)
    const startCol = Math.min(columns.indexOf(selectionStart.col), columns.indexOf(selectionEnd.col))
    const endCol = Math.max(columns.indexOf(selectionStart.col), columns.indexOf(selectionEnd.col))

    const cells = []
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        cells.push({ row: r, col: columns[c] })
      }
    }
    return cells
  }

  const isCellSelected = (row, col) => {
    if (!selectionStart || !selectionEnd) return false

    const startRow = Math.min(selectionStart.row, selectionEnd.row)
    const endRow = Math.max(selectionStart.row, selectionEnd.row)
    const startCol = Math.min(columns.indexOf(selectionStart.col), columns.indexOf(selectionEnd.col))
    const endCol = Math.max(columns.indexOf(selectionStart.col), columns.indexOf(selectionEnd.col))

    return row >= startRow && row <= endRow && columns.indexOf(col) >= startCol && columns.indexOf(col) <= endCol
  }

  const isCellInMergedArea = (row, col, position) => {
    if (!position?.mergedCells?.length) return false
    return position.mergedCells.some((cell) => cell.row === row && cell.col === col)
  }

  const handleCreatePosition = () => {
    const selectedCells = getSelectedCells()
    if (selectedCells.length === 0) return

    const startCell = selectedCells[0]
    setNewPosition({
      id: `pos_${Date.now()}`,
      nombre: "",
      tipo: "",
      estado: "disponible",
      detalles: "",
      fila: startCell.row,
      columna: startCell.col,
      color: "#B0BEC5",
      piso: selectedPiso,
      sede: "",
      servicio: "",
      dispositivos: "",
      mergedCells: selectedCells,
    })
    setIsModalOpen(true)
  }

  const getNextColumn = (currentColumns) => {
    const lastColumn = currentColumns[currentColumns.length - 1]
    if (lastColumn.length === 1) {
      if (lastColumn === "Z") return "AA"
      return String.fromCharCode(lastColumn.charCodeAt(0) + 1)
    } else {
      const firstChar = lastColumn[0]
      const secondChar = lastColumn[1]
      if (secondChar === "Z") {
        return String.fromCharCode(firstChar.charCodeAt(0) + 1) + "A"
      }
      return firstChar + String.fromCharCode(secondChar.charCodeAt(0) + 1)
    }
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
  }

  const handleAddNewPosition = () => {
    setNewPosition({
      id: `pos_${Date.now()}`,
      nombre: "",
      tipo: "",
      estado: "disponible",
      detalles: "",
      fila: 1,
      columna: "A",
      color: "#B0BEC5",
      piso: selectedPiso,
      sede: "",
      servicio: "",
      dispositivos: "",
      mergedCells: [],
    })
    setIsModalOpen(true)
  }

  const exportToExcel = () => {
    const positionsArray = Object.values(positions).filter((pos) => pos.piso === selectedPiso)
    const worksheet = XLSX.utils.json_to_sheet(positionsArray)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Posiciones")
    XLSX.writeFile(workbook, `Posiciones_${selectedPiso}_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

const importFromExcel = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Obtener el rango de celdas
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Recorrer las filas y columnas
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];

        if (cell) {
          const cellValue = cell.v;
          const cellColor = cell.s ? cell.s.bgColor : null;

          // Crear la posición
          const position = {
            id: `pos_${Date.now()}_${row}_${col}`,
            nombre: cellValue || "",
            tipo: "",
            estado: "disponible",
            detalles: "",
            fila: row + 1, // Las filas en Excel comienzan desde 0
            columna: XLSX.utils.encode_col(col), // Convertir el índice de columna a letra
            color: cellColor || "#B0BEC5",
            piso: selectedPiso,
            sede: "",
            servicio: "",
            dispositivos: "",
            mergedCells: [],
          };

          try {
            const response = await fetch(`${API_URL}posiciones/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(position),
            });

            if (!response.ok) {
              console.error(`Error al importar posición: ${position.id}`);
            }
          } catch (error) {
            console.error("Error al importar:", error);
          }
        }
      }
    }

    fetchPositions();
  };
  reader.readAsArrayBuffer(file);
};

  const filteredPositions = Object.values(positions).filter(
    (pos) =>
      pos.piso === selectedPiso &&
      (searchTerm === "" ||
        pos.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pos.servicio.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleEditPosition = (position) => {
    setNewPosition(position)
    setIsModalOpen(true)
  }

  const renderTableCell = (position, row, col, isSelected, isMainCell, colSpan, rowSpan) => {
    const backgroundColor = isSelected ? "rgba(108, 99, 255, 0.2)" : position?.color || "#ffffff"
    const textColor = position ? getContrastColor(position.color) : "#000000"

    return (
      <td
        key={`${row}-${col}`}
        colSpan={colSpan}
        rowSpan={rowSpan}
        onMouseDown={() => handleCellMouseDown(row, col)}
        onMouseEnter={() => handleCellMouseEnter(row, col)}
        onClick={() => position && handleEditPosition(position)}
        style={{
          backgroundColor,
          color: textColor,
          position: "relative",
        }}
        className={`table-cell ${isSelected ? "selected" : ""} ${isMainCell ? "main-cell" : ""}`}
      >
        {position?.nombre || ""}
        {position && (
          <div
            className="status-indicator"
            style={{
              backgroundColor:
                position.estado === "disponible"
                  ? "green"
                  : position.estado === "ocupado"
                    ? "red"
                    : position.estado === "reservado"
                      ? "orange"
                      : "gray",
            }}
          />
        )}
      </td>
    )
  }

  return (
    <div className="container">
      <h1>Sistema de Gestión de Planos de Piso</h1>

      <div className="controls-container">
        <div className="tabs">
          {PISOS.map((piso) => (
            <button
              key={piso.value}
              className={`tab-button ${selectedPiso === piso.value ? "active" : ""}`}
              onClick={() => setSelectedPiso(piso.value)}
            >
              {piso.label}
            </button>
          ))}
        </div>

        <div className="search-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button className="action-button" onClick={handleAddNewPosition}>
            <FaPlus /> Nueva Posición
          </button>

          <button className="action-button" onClick={exportToExcel}>
            <FaDownload /> Exportar
          </button>

          <div className="import-container">
            <button className="action-button" onClick={() => document.getElementById("import-excel").click()}>
              <FaUpload /> Importar
            </button>
            <input
              id="import-excel"
              type="file"
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              onChange={importFromExcel}
            />
          </div>
        </div>
      </div>

      <div className="zoom-controls">
        <button className="zoom-button" onClick={handleZoomIn}>
          <FaSearchPlus />
        </button>
        <button className="zoom-button" onClick={handleZoomOut}>
          <FaSearchMinus />
        </button>
        <button className="zoom-button" onClick={handleResetZoom}>
          <FaUndo />
        </button>
        <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>

        <div className="divider"></div>

        <button className="control-button" onClick={() => setRows(rows + 1)}>
          <FaPlus className="mr-2" /> Agregar Fila
        </button>
        <button className="control-button" onClick={() => setColumns([...columns, getNextColumn(columns)])}>
          <FaPlus className="mr-2" /> Agregar Columna
        </button>
      </div>

      <div
        className="table-container"
        ref={tableContainerRef}
        onMouseLeave={() => setIsSelecting(false)}
        onMouseUp={handleCellMouseUp}
      >
        <table className="table" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}>
          <thead>
            <tr>
              <th className="fixed-header"></th>
              {columns.map((col) => (
                <th key={col} className="column-header">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, i) => i + 1).map((row) => (
              <tr key={row}>
                <td className="row-header">{row}</td>
                {columns.map((col) => {
                  const position = filteredPositions.find(
                    (p) => (p.fila === row && p.columna === col) || isCellInMergedArea(row, col, p),
                  )

                  const isMainCell = position?.fila === row && position?.columna === col
                  const isMerged = position && isCellInMergedArea(row, col, position)
                  const isSelected = isCellSelected(row, col)

                  // Skip rendering if this cell is part of a merged area but not the main cell
                  if (isMerged && !isMainCell) {
                    return null
                  }

                  let colSpan = 1
                  let rowSpan = 1

                  if (isMainCell && position.mergedCells?.length > 0) {
                    const cells = position.mergedCells
                    const maxCol = Math.max(...cells.map((c) => columns.indexOf(c.col)))
                    const minCol = Math.min(...cells.map((c) => columns.indexOf(c.col)))
                    const maxRow = Math.max(...cells.map((c) => c.row))
                    const minRow = Math.min(...cells.map((c) => c.row))
                    colSpan = maxCol - minCol + 1
                    rowSpan = maxRow - minRow + 1
                  }

                  return renderTableCell(position, row, col, isSelected, isMainCell, colSpan, rowSpan)
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              className="close-button"
              onClick={() => {
                setIsModalOpen(false)
                clearSelection()
              }}
            >
              <FaTimes />
            </button>
            <h2>{newPosition.id && positions[newPosition.id] ? "Editar Posición" : "Agregar Posición"}</h2>

            <div className="form-grid">
              <div className="form-group">
                <label>Id:</label>
                <input
                  value={newPosition.id}
                  onChange={(e) => setNewPosition({ ...newPosition, id: e.target.value })}
                  disabled={!!positions[newPosition.id]}
                />
              </div>

              <div className="form-group">
                <label>Nombre:</label>
                <input
                  value={newPosition.nombre}
                  onChange={(e) => setNewPosition({ ...newPosition, nombre: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Tipo:</label>
                <input
                  value={newPosition.tipo}
                  onChange={(e) => setNewPosition({ ...newPosition, tipo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Estado:</label>
                <div className="select-with-preview">
                  <select
                    value={newPosition.estado}
                    onChange={(e) => setNewPosition({ ...newPosition, estado: e.target.value })}
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                  <div
                    className="estado-preview"
                    style={{ backgroundColor: ESTADOS.find((e) => e.value === newPosition.estado)?.color }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Color:</label>
                <div className="select-with-preview">
                  <select
                    value={newPosition.color}
                    onChange={(e) => setNewPosition({ ...newPosition, color: e.target.value })}
                  >
                    {COLORES.map((color) => (
                      <option
                        key={color.value}
                        value={color.value}
                        style={{
                          backgroundColor: color.value,
                          color: getContrastColor(color.value),
                        }}
                      >
                        {color.label}
                      </option>
                    ))}
                  </select>
                  <div className="color-preview" style={{ backgroundColor: newPosition.color }} />
                </div>
              </div>

              <div className="form-group">
                <label>Piso:</label>
                <select
                  value={newPosition.piso}
                  onChange={(e) => setNewPosition({ ...newPosition, piso: e.target.value })}
                >
                  {PISOS.map((piso) => (
                    <option key={piso.value} value={piso.value}>
                      {piso.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label>Sede:</label>
                <input
                  value={newPosition.sede}
                  onChange={(e) => setNewPosition({ ...newPosition, sede: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Servicio:</label>
                <input
                  value={newPosition.servicio}
                  onChange={(e) => setNewPosition({ ...newPosition, servicio: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Dispositivos:</label>
                <input
                  value={newPosition.dispositivos}
                  onChange={(e) => setNewPosition({ ...newPosition, dispositivos: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Detalles:</label>
                <textarea
                  value={newPosition.detalles}
                  onChange={(e) => setNewPosition({ ...newPosition, detalles: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-buttons">
              <button className="save-button" onClick={savePosition}>
                Guardar
              </button>
              {newPosition.id && positions[newPosition.id] && (
                <button className="delete-button" onClick={() => deletePosition(newPosition.id)}>
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FloorPlan