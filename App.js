import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const rows = 10, cols = 10, mines = 10;

const App = () => {
  const [board, setBoard] = useState([]);
  const [mineCount, setMineCount] = useState(mines);
  const [gameOver, setGameOver] = useState(false);
  const [losses, setLosses] = useState(0);

  useEffect(() => {
    createBoard();
  }, []);

  const createBoard = () => {
    let newBoard = Array.from({ length: rows }, () => 
      Array(cols).fill(null).map(() => ({ 
        mine: false, revealed: false, flag: false, count: 0 
      }))
    );
    setMineCount(mines);
    setGameOver(false);
    placeMines(newBoard);
    calculateNumbers(newBoard);
    setBoard(newBoard);
  };

  const placeMines = (newBoard) => {
    let placed = 0;
    while (placed < mines) {
      let r = Math.floor(Math.random() * rows);
      let c = Math.floor(Math.random() * cols);
      if (!newBoard[r][c].mine) {
        newBoard[r][c].mine = true;
        placed++;
      }
    }
  };

  const calculateNumbers = (newBoard) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newBoard[r][c].mine) continue;
        let count = 0;
        directions.forEach(([dr, dc]) => {
          let nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].mine) {
            count++;
          }
        });
        newBoard[r][c].count = count;
      }
    }
  };

  const saveLossesToFirestore = async (losses) => {
    try {
      const docRef = await addDoc(collection(db, "games"), { // Nombre de la colección "games"
        losses: losses, // Guarda la cantidad de partidas perdidas
        timestamp: new Date() // Opcional: guarda la fecha y hora
      });
      console.log("Partidas perdidas guardadas con ID: ", docRef.id);
    } catch (e) {
      console.error("Error al guardar las partidas perdidas: ", e);
      Alert.alert("Error", "No se pudieron guardar las partidas perdidas.");
    }
  };

  const revealCell = (r, c) => {
    if (gameOver || board[r][c].flag || board[r][c].revealed) return;
    let newBoard = [...board];
    newBoard[r][c].revealed = true;
    
    if (newBoard[r][c].mine) {
      setGameOver(true);
      setLosses(prevLosses => {
        const newLosses = prevLosses + 1;
        saveLossesToFirestore(newLosses); // Guardar en Firestore
        return newLosses;
      });
      newBoard.forEach(row => row.forEach(cell => (cell.revealed = true)));
      Alert.alert("Fin del juego", "¡Has perdido!");
    } else if (newBoard[r][c].count === 0) {
      revealAdjacent(newBoard, r, c);
    }
    
    setBoard(newBoard);
  };

  const revealAdjacent = (newBoard, r, c) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    directions.forEach(([dr, dc]) => {
      let nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !newBoard[nr][nc].revealed && !newBoard[nr][nc].flag) {
        newBoard[nr][nc].revealed = true;
        if (newBoard[nr][nc].count === 0) {
          revealAdjacent(newBoard, nr, nc);
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscaminas</Text>
      <Text style={styles.subtitle}>Minas restantes: {mineCount}</Text>
      <Text style={styles.subtitle}>Partidas Perdidas: {losses}</Text>
      <View style={styles.board}>
        {board.map((row, r) => 
          row.map((cell, c) => (
            <TouchableOpacity 
              key={`${r}-${c}`} 
              style={[styles.cell, cell.revealed && styles.revealedCell]} 
              onPress={() => revealCell(r, c)}
            >
              <Text>{cell.revealed ? (cell.mine ? "💣" : cell.count > 0 ? cell.count : "") : ""}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
      <TouchableOpacity style={styles.button} onPress={createBoard}>
        <Text style={styles.buttonText}>Volver a Jugar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 300,
  },
  cell: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: "#999",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "lightgray",
  },
  revealedCell: {
    backgroundColor: "#7d9de2",
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default App;
