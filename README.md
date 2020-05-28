## Команды для работы
- Вначале, проверяю файл package.json - добавляю или убираю ненужные для проекта зависимости. Затем, в этой же папке, с шифтом вызываю контекстное меню и запускаю командную строку.

npm i
Можно работать!

- Создать БЭМ файловую структуру в папке blocks:
Вначале, надо описать файловую структуру в корне проекта, в файле bem.json (пример есть внутри createbem.js). После этого в консоли запустить сам скрипт:
node .\createbem.js

- Запустить проект в режиме разработки:
npm start

- Собрать проект в папку public:
npm run build


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



- Если git ругается на неправильный формат переносов (fatal: LF would be replaced by CRLF in), то либо привести все файлы к одной кодировке для текущей операционной системы, либо отключить настройку проверки переносов:

- $ git config --global core.autocrlf false
- $ git config --global core.safecrlf false

## Авторизация на сервере через ssh по открытому ключу
Вначале нужно запустить на Windows подсистему Linux. После этого появится доступ к консоли bash, все в дальнейшем делается через нее (это важно!). Команда ~/ означает корневую директорию, перейти в корень cd ~

# Меню пуск => Параметры => Обновление и безопасность => Для разрабочиков => Режим разработчика
# Меню пуск => Параметры => Приложения => Программы и компоненты => Включение или отключение компонентов Windows => Подсистема Windows для Linux => Перезагрузка

Запускаем PowerShell от имени Администратора (актуальную версию node.js посмотреть на офф. сайте)
- > Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
- > cd ~
- > curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
- > sudo bash nodesource_setup.sh
- > sudo apt-get install nodejs
- bash
- $ mkdir -p ~/.ssh
- $ chmod 700 ~/.ssh
- $ cd ~/.ssh
- $ ssh-keygen
В папке .ssh создаются два ключа id_rsa и id_rsa.pub. Ключ id_rsa.pub копирую на сервер, просто в корень. Дальше работаем на сервере через ssh консоль.
- $ scp -p id_rsa.pub sshusername@yousite.com:~
- $ ssh sshusername@yousite.com
- $ mkdir -p ~/.ssh
- $ chmod 700 ~/.ssh
- $ cat id_rsa.pub >> ~/.ssh/authorized_keys
- $ chmod 0400 ~/.ssh/authorized_keys
- $ rm -f ~/id_rsa.pub
- $ logout
Опять на своем компьютере.
- $ ssh-add
Если не сработало, значит не запущен ssh агент. Надо его запустить:
- $ eval `ssh-agent -s`
- ssh-add
После этого надо попробовать снова подключиться к серверу через ssh, если все нормально, то сервер больше не будет спрашивать пароль.
- $ ssh sshusername@yousite.com

P.S.
Если во время "$ ssh-add /mnt/d/someproject/.ssh/id_rsa" появляется ошибка связанная с разрешением файла, то надо:
1. выйти в корень внутри bash $ cd .. 
2. размонтировать текущий диск $ sudo umount /mnt/d
3. смонтировать его с ключами $ sudo mount -t drvfs D: /mnt/d -o metadata
4. проверить появился ли у него при $ mount -l ключ "metadata"
5. выставить публичному ключу разрешения "только для чтения" $ sudo chmod 0400 /mnt/d/someproject/.ssh/id_rsa
6. повторить $ ssh-add /mnt/d/someproject/.ssh/id_rsa

