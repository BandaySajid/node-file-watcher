const fs = require('fs/promises');

(async function () {

    const CREATE_FILE = "create a file";
    const DELETE_FILE = "delete the file";
    const RENAME_FILE = "rename the file";
    const ADD_CONTENT = "add the content";

    const createFile = async (path) => {
        try {
            const existingFileHandle = await fs.open(path, 'r');
            existingFileHandle.close();
            return console.log(`The file ${path} already exists`);
        }
        catch (err) {

            const newFileHandle = await fs.open(path, 'w');
            newFileHandle.close();
            return console.log(`The file ${path} was created successfully`);
        }
    };

    const deleteFile = async (path) => {
        try {
            await fs.unlink(path);
            return console.log(`The file ${path} was deleted successfully`);
        }
        catch (e) {
            if (e.code === "ENOENT") {
                console.log("No file at this path to remove.");
            } else {
                console.log("An error occurred while removing the file: ");
                console.log(e);
            }
        }
    };

    const renameFile = async (existingName, newName) => {
        try {
            await fs.rename(existingName, newName);
            return console.log(`The file ${existingName} was successfully renamed to ${newName}`);
        }
        catch (e) {
            if (e.code === "ENOENT") {
                console.log("No file at this path to rename.");
            } else {
                console.log("An error occurred while renaming the file: ");
                console.log(e);
            }
        }
    };

    let addedContent;

    const addContent = async (path, content) => {
        if(addedContent === content){
            return console.log('The content is same as before, so cannot add!');
        }
        try {
            const fileHandle = await fs.open(path, 'a');
            fileHandle.write(content);
            fileHandle.close();

            return console.log(`The content was successfully added to the file ${path}`);
        }
        catch (err) {
            console.log("An error occurred while adding content to the file: ");
            console.log(e);
        }
    };

    const commandFileHandler = await fs.open('./command.txt', 'r');
    commandFileHandler.on('change', async () => {

        //getting the byte size of file to allocate a buffer.
        const size = (await commandFileHandler.stat()).size;

        //allocating buffer as size of the file.
        const buff = Buffer.alloc(size);

        //offset is the location in the buffer from which it will start filling in, in this case it will be 0 because we want to fill the content bytes from start.
        const offset = 0;

        //length is the number of bytes to read from buffer, which in case will be the ByteLength of the buffer because we want to read the whole content.
        const length = buff.byteLength;

        //position is the position from which we want to start reading the content, in this case it will be 0 as we want read the content from start.
        const position = 0;

        //reading the content, giving the buffer and other options.
        await commandFileHandler.read(buff, offset, length, position);

        const command = buff.toString('utf-8');
        const filePath = command.split(' ')[3]

        //Create a file
        if (command.includes(CREATE_FILE)) {
            const path = filePath;
            createFile(path);
        }

        //Delete the file
        if (command.includes(DELETE_FILE)) {
            const path = filePath;
            deleteFile(path);
        }

        //Rename the file
        if (command.includes(RENAME_FILE)) {
            const splittedString = command.split(' ');
            const existingName = filePath;
            const newName = splittedString[5];
            renameFile(existingName, newName);
        }

        //Add the content
        if (command.includes(ADD_CONTENT)) {
            const path = filePath;
            const content = command.split(':')[1].trim();
            addContent(path, content);
            addedContent = content
        }

    });


    const watcher = await fs.watch('command.txt');
    for await (const event of watcher) {
        if (event.eventType === 'change') {
            //file was changed
            //emitting event for processing
            commandFileHandler.emit("change");
        }
    }
})();