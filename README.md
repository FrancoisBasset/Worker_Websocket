# Test technique WINAMAX

Les technologies utilisés par ce test sont :
- Node.js (`http`, `fs`, `worker_threads`, `redis`, `websocket`, `crypto`)
- HTML
- Javascript (Du simple JS sans framework)

## Le Back

J'ai crée un serveur http avec le module `http`.
Dans ce serveur il y a la route `GET /` pour servir le HTML et la route `POST /bet` qui va du worker au serveur http.

Ensuite WebSocket est instancié et utilisé le même serveur HTTP pour la base.

## Le Front

Le front est très simple et écrit en HTML en JavaScript pur. 
J'instancie le WebSocket et lors du clic j'envoie un objet
			{
				command: 'enqueue',
				count: count,
				mid: crypto.randomUUID()
			}
au websocket.
Ce socket a un listener qui permet de mettre à jour le compteur, le temps et le statut.

## Les difficultés

J'ai eu des difficultés dans l'échange depuis le websocket vers le worker, et la manière dont fonctionne le websocket.
J'ai fait de la veille sur le Worker, et j'ai vu qu'il fallait utiliser `parentPort`.

J'ai du aussi regarder comment fonctionne le module http car j'ai l'habitude d'utiliser express, pour l'exercice j'ai voulu faire un code sans trop de dépendances.
J'ai regardé comment faire cela sur un tutoriel.

J'ai solutionné cela à coups de recherche sur StackOverflow, et en debogant mon code et en le testant plusieurs fois.