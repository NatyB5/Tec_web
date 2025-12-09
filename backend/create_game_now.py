import mysql.connector
from datetime import datetime

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'senha123',
    'database': 'bingo_db'
}

def create_game():
    try:
        cnx = mysql.connector.connect(**DB_CONFIG)
        cursor = cnx.cursor()

        # 1. Get a room (Sala)
        cursor.execute("SELECT id_sala FROM SALA LIMIT 1")
        sala = cursor.fetchone()
        if not sala:
            print("Criando sala padrão...")
            cursor.execute("INSERT INTO SALA (nome, descricao) VALUES ('Sala Principal', 'Sala para jogos gerais')")
            sala_id = cursor.lastrowid
        else:
            sala_id = sala[0]

        # 2. Create Game (Jogo) for 20:30 today
        # Assuming today is 2025-12-08 based on context
        game_time = '2025-12-08 20:30:00'
        
        query_game = ("INSERT INTO JOGO (data_hora, id_sala, preco_cartela) "
                      "VALUES (%s, %s, %s)")
        cursor.execute(query_game, (game_time, sala_id, 5.00))
        game_id = cursor.lastrowid
        print(f"Jogo criado com ID: {game_id} para {game_time}")

        # 3. Create Prize (Premio)
        query_prize = ("INSERT INTO PREMIOS (descricao, valor, id_jogo) "
                       "VALUES (%s, %s, %s)")
        cursor.execute(query_prize, ('Prêmio da Rodada', 100.00, game_id))
        print(f"Prêmio criado para o jogo {game_id}")

        cnx.commit()
        cursor.close()
        cnx.close()
        print("Sucesso!")

    except mysql.connector.Error as err:
        print(f"Erro: {err}")

if __name__ == "__main__":
    create_game()
