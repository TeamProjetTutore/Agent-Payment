import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

def test_connection():
    print("🔍 Test de connexion à la base de données PostgreSQL")
    print("=" * 50)
    
    # Votre URL de connexion
    DATABASE_URL = "postgresql://postgres:%40%40%40%40@localhost:5432/DB_AgentPayment"
    
    print(f"URL de connexion: {DATABASE_URL}")
    print()
    
    try:
        # 1. Création de l'engine
        engine = create_engine(DATABASE_URL, echo=False)
        print("✅ Engine SQLAlchemy créé")
        
        # 2. Test de connexion
        with engine.connect() as connection:
            print("✅ Connexion établie avec succès!")
            print()
            
            # 3. Informations système
            print("📊 Informations de la base:")
            print("-" * 30)
            
            # Version
            result = connection.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"PostgreSQL: {version.split(',')[0]}")
            
            # Base de données
            result = connection.execute(text("SELECT current_database()"))
            db_name = result.fetchone()[0]
            print(f"Base: {db_name}")
            
            # Utilisateur
            result = connection.execute(text("SELECT current_user"))
            user = result.fetchone()[0]
            print(f"Utilisateur: {user}")
            
            # Heure serveur
            result = connection.execute(text("SELECT now()"))
            server_time = result.fetchone()[0]
            print(f"Heure serveur: {server_time}")
            
            # Taille de la base
            result = connection.execute(text("""
                SELECT pg_size_pretty(pg_database_size(current_database()))
            """))
            size = result.fetchone()[0]
            print(f"Taille: {size}")
            
            print()
            
            # 4. Liste des tables
            print("📋 Tables dans le schéma 'public':")
            print("-" * 30)
            
            result = connection.execute(text("""
                SELECT table_name, table_type
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            
            tables = result.fetchall()
            if tables:
                for table in tables:
                    print(f"  {table[0]} ({table[1]})")
            else:
                print("  Aucune table trouvée")
                print("\n💡 Conseil: Créez vos tables avec Base.metadata.create_all()")
            
            print()
            print("✅ Tous les tests ont réussi!")
            print(f"📡 Backend → Base de données: COMMUNICATION ÉTABLIE")
            
    except OperationalError as e:
        print(f"❌ ERREUR DE CONNEXION: {e}")
        print("\n🔧 Dépannage:")
        print("1. PostgreSQL est-il démarré? (services.msc)")
        print("2. Le port 5432 est-il ouvert?")
        print("3. La base 'DB_AgentPayment' existe-t-elle?")
        print("4. Le mot de passe est-il correct?")
        
    except Exception as e:
        print(f"❌ ERREUR INATTENDUE: {e}")
        
    finally:
        print("=" * 50)

if __name__ == "__main__":
    test_connection()
