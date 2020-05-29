## Команды для работы
> Вначале, проверяю файл package.json - добавляю или убираю ненужные для проекта зависимости. Затем, в этой же папке, с шифтом вызываю контекстное меню и запускаю командную строку.

`npm i`
> Можно работать!

- Создать БЭМ файловую структуру в папке blocks:
> Вначале, надо описать файловую структуру в корне проекта, в файле bem.json. После этого в консоли запустить сам скрипт:
`node .\createbem.js`

> Запустить проект в режиме разработки:
`npm start`

> Собрать проект в папку public:
`npm run build`


## Команды npm:
- node -h — показывает список всех доступных команд Node.js
- node -v, node --version — показывает установленную версию Node.js.
- npm -h — показывает список всех доступных команд пакетного менеджера npm
- npm -v, npm --version — показывает установленную версию npm
- npm update npm -g позволяет обновить версию npm
- npm list --depth=0 показывает список установленных пакетов
- npm outdated --depth=0 покажет список установленных пакетов, которые требуют обновления.
- npm install $name — позволяет установить любой пакет по его имени. Если при этом к команде добавить префикс -g пакет будет установлен глобально на весь компьютер. -S - как dependencies, -D как devDependencies. 
- npm install $name@1.0.1 — если вы хотите установить конкретную версию пакета, воспользуйтесь префиксом @ с номером версии. Если без указания пакета, то установит все по списку из package.json (npm up больше не надо использовать)
- npm i $name — является укороченной альтернативой предыдущей команды
- npm uninstall $name — удаляет установленный пакет по имени
- npm r $name - удалить пакет (синоним)
- npm list $name — покажет версию установленного пакета
- npm update $name — обновить версию установленного пакета
- npm view $name version — покажет последнюю версию пакета, которая существует
- npm init -y - создать пустой, стандартный package.json


## Команды git:
- $ git init 
- $ git add <!-- добавить в кэш -->
- $ git status
- $ git log
- $ git commit -m <commit name>
- $ git branch <new branch name> 
- $ git checkout -b <new branch name> 
- $ git checkout <branch name> 
- $ git branch -d <branch name> 
- $ git merge <another branch name> 
- $ git push -u origin master
- $ git clone https://github.com/somename/someproject.git ./

> Если git ругается на неправильный формат переносов (fatal: LF would be replaced by CRLF in), то либо привести все файлы к одной кодировке для текущей операционной системы, либо отключить настройку проверки переносов:

- $ git config --global core.autocrlf false
- $ git config --global core.safecrlf false


## Альясы для git
> В файле .gitconfig добавить секцию [alias] со следующим содержимым:

*	s = status --short
*	st = status
*	l = log --oneline --graph --decorate --all
*	g = log --graph --abbrev-commit --decorate --all --format=format:'%C(bold blue)%h%C(reset) - %C(bold cyan)%aD%C(dim white) - %an%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n %C(white)%s%C(reset)'
*	br = branch
*	co = checkout
*   cm = commit -am

> Это позволит вместо полной записи команд в консоли, использовать короткие альясы - git st

