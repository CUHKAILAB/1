/*
Copyright (C): 2021-2030, The Chinese University of Hong Kong.
*/

enum Content1 {
    //% block="X center"
    xCenter = 1,
    //% block="Y center"
    yCenter = 2,
    //% block="width"
    width = 3,
    //% block="height"
    height = 4
}

enum Content2 {
    //% block="X beginning"
    xOrigin = 1,
    //% block="Y beginning"
    yOrigin = 2,
    //% block="X endpoint"
    xTarget = 3,
    //% block="Y endpoint"
    yTarget = 4
}

enum Content3 {
    //% block="ID"
    ID = 5,
    //% block="X center"
    xCenter = 1,
    //% block="Y center"
    yCenter = 2,
    //% block="width"
    width = 3,
    //% block="height"
    height = 4
}

enum Content4 {
    //% block="ID"
    ID = 5,
    //% block="X beginning"
    xOrigin = 1,
    //% block="Y beginning"
    yOrigin = 2,
    //% block="X endpoint"
    xTarget = 3,
    //% block="Y endpoint"
    yTarget = 4

}

enum HUSKYLENSResultType_t {
    //%block="frame"
    HUSKYLENSResultBlock = 1,
    //%block="arrow"
    HUSKYLENSResultArrow = 2,
}

let FIRST = {
        first: -1,
        xCenter: -1,
        xOrigin: -1,
        protocolSize: -1,
        algorithmType: -1,
        requestID: -1,
    };

enum HUSKYLENSMode{
    //%block="save"
    SAVE,
    //%block="load"
    LOAD,
}
enum HUSKYLENSphoto{
    //%block="photo"
    PHOTO,
    //%block="screenshot"
    SCREENSHOT
}
enum protocolCommand {
    COMMAND_REQUEST = 0x20,
    COMMAND_REQUEST_BLOCKS = 0x21,
    COMMAND_REQUEST_ARROWS = 0x22,
    COMMAND_REQUEST_LEARNED = 0x23,
    COMMAND_REQUEST_BLOCKS_LEARNED = 0x24,
    COMMAND_REQUEST_ARROWS_LEARNED = 0x25,
    COMMAND_REQUEST_BY_ID = 0x26,
    COMMAND_REQUEST_BLOCKS_BY_ID = 0x27,
    COMMAND_REQUEST_ARROWS_BY_ID = 0x28,
    COMMAND_RETURN_INFO = 0x29,
    COMMAND_RETURN_BLOCK = 0x2A,
    COMMAND_RETURN_ARROW = 0x2B,
    COMMAND_REQUEST_KNOCK = 0x2C,
    COMMAND_REQUEST_ALGORITHM = 0x2D,
    COMMAND_RETURN_OK = 0x2E,
    COMMAND_REQUEST_LEARN = 0x2F,
    COMMAND_REQUEST_FORGET = 0x30,
    COMMAND_REQUEST_SENSOR = 0x31,

}

enum protocolAlgorithm {
    //%block="Face Recognition"
    ALGORITHM_FACE_RECOGNITION = 0,
    //%block="Object Tracking"
    ALGORITHM_OBJECT_TRACKING = 1,
    //%block="Object Recognition"
    ALGORITHM_OBJECT_RECOGNITION = 2,
    //%block="Line Tracking"
    ALGORITHM_LINE_TRACKING = 3,
    //%block="Color Recognition"
    ALGORITHM_COLOR_RECOGNITION = 4,
    //%block="Tag Recognition"
    ALGORITHM_TAG_RECOGNITION = 5,
    //%block="Object Classification"
    OBJECTCLASSIFICATION,
    //%block="QR Recogmition (EDU only)"
    QRRECOGMITION,
    //%block="Barcode Recognition (EDU only)"
    BARCODERECOGNITION,

}


//% weight=100  color=#e7660b icon="\uf083"  block="HuskyLens"
namespace huskylens {
    let protocolPtr: number[][] = [[0], [0], [0], [0], [0], [0], [0], [0], [0], [0]]
    let Protocol_t: number[] = [0, 0, 0, 0, 0, 0]
    let i = 1;
    let FRAME_BUFFER_SIZE = 128
    let HEADER_0_INDEX = 0
    let HEADER_1_INDEX = 1
    let ADDRESS_INDEX = 2
    let CONTENT_SIZE_INDEX = 3
    let COMMAND_INDEX = 4
    let CONTENT_INDEX = 5
    let PROTOCOL_SIZE = 6
    let send_index = 0;
    let receive_index = 0;

    let COMMAND_REQUEST = 0x20;

    let receive_buffer: number[] = [];
    let send_buffer: number[] = [];
    let buffer: number[] = [];

    let send_fail = false;
    let receive_fail = false;
    let content_current = 0;
    let content_end = 0;
    let content_read_end = false;

    let command: number
    let content: number
    

    //% advanced=true shim=i2c::init
    function init(): void {
        return;
    }

    /**
     * HuskyLens init I2C until success
     */
    //%block="HuskyLens initialize I2C until success"
    //% weight=90
    export function initI2c(): void {
        init();
        while(!readKnock());

        yes();
    }
    /**
     * HuskyLens change mode algorithm until success.
     */
    //%block="HuskyLens switch algorithm to %mode"
    //% weight=85
    export function initMode(mode: protocolAlgorithm) {
        writeAlgorithm(mode, protocolCommand.COMMAND_REQUEST_ALGORITHM)
        while(!wait(protocolCommand.COMMAND_RETURN_OK));
        yes();
    }
    /**
     * HuskyLens requests data and stores it in the result.
     */

    //% block="HuskyLens request data once and save into the result"
    //% weight=80
    export function request(): void {
        protocolWriteCommand(protocolCommand.COMMAND_REQUEST)
        processReturn();
    }
    /**
     * HuskyLens get the number of the learned ID from result.
     */
    //%block="HuskyLens get a total number of learned IDs from the result"
    //% weight=79
    export function getIds(): number {
        return Protocol_t[2];
    }
    /**
     * The box or arrow HuskyLens got from result appears in screen?
     */
    //%block="HuskyLens check if %Ht is on screen from the result"
    //% weight=78
    export function isAppear_s(Ht: HUSKYLENSResultType_t): boolean {
        switch (Ht) {
            case 1:
                return countBlocks_s() != 0 ? true:false;
            case 2:
                return countArrows_s() != 0 ? true:false;
            default:
                return false;
        }
    }
    /**
     * HuskyLens get the parameter of box near the screen center from result.
     */
    //% block="HuskyLens get %data of frame closest to the center of screen from the result"
    //% weight=77
    export function readBox_s(data: Content3): number {
        let hk_x
        let hk_y = readBlockCenterParameterDirect();
        if (hk_y != -1) {
            switch (data) {
                case 1:
                    hk_x = protocolPtr[hk_y][1]; break;
                case 2:
                    hk_x = protocolPtr[hk_y][2]; break;
                case 3:
                    hk_x = protocolPtr[hk_y][3]; break;
                case 4:
                    hk_x = protocolPtr[hk_y][4]; break;
                default:
                    hk_x = protocolPtr[hk_y][5];
            }
        }
        else hk_x = -1
        return hk_x;
    }
    /**
     * HuskyLens get the parameter of arrow near the screen center from result.
     */
    //% block="HuskyLens get %data of arrow closest to the center of screen from the result"
    //% weight=77
    export function readArrow_s(data: Content4): number {
        let hk_x
        let hk_y = readArrowCenterParameterDirect()
        if (hk_y != -1) {
            switch (data) {
                case 1:
                    hk_x = protocolPtr[hk_y][1]; break;
                case 2:
                    hk_x = protocolPtr[hk_y][2]; break;
                case 3:
                    hk_x = protocolPtr[hk_y][3]; break;
                case 4:
                    hk_x = protocolPtr[hk_y][4]; break;
                default:
                    hk_x = protocolPtr[hk_y][5];
            }
        }else hk_x = -1
        return hk_x;
    }
    /**
     * The ID Huskylens got from result has been learned before?
     * @param id to id ,eg: 1
     */
    //% block="HuskyLens check if ID %id is learned from the result"
    //% weight=76
    export function isLearned(id: number): boolean {
        let hk_x = countLearnedIDs();
        if (id <= hk_x) return true;
        return false;
    }
    /**
     * The box or arrow corresponding to ID obtained by HuskyLens from result appears in screen？
     * @param id to id ,eg: 1
     */
    //% block="HuskyLens check if ID %id %Ht is on screen from the result"
    //% weight=75
    export function isAppear(id: number, Ht: HUSKYLENSResultType_t): boolean {
        switch (Ht) {
            case 1:
                return countBlocks(id) != 0 ? true : false ;
            case 2:
                return countArrows(id) != 0 ? true : false;
            default:
                return false;
        }
    }
    /**
     * HuskyLens get the parameter of the box corresponding to ID from result.
     * @param id to id ,eg: 1
     */
    //%block="HuskyLens get  $number1 of ID $id frame from the result"
    //% weight=65
    export function readeBox( id: number,number1: Content1): number {
        let hk_y = cycle_block(id, 1);
        let hk_x
        if (countBlocks(id) != 0) {
            if (hk_y != null) {
                switch (number1) {
                    case 1:
                        hk_x = protocolPtr[hk_y][1]; break;
                    case 2:
                        hk_x = protocolPtr[hk_y][2]; break;
                    case 3:
                        hk_x = protocolPtr[hk_y][3]; break;
                    case 4:
                        hk_x = protocolPtr[hk_y][4]; break;
                }
            }
            else hk_x = -1;
        }
        else hk_x = -1;
        return hk_x;
    }
     /**
     * HuskyLens get the parameter of the arrow corresponding to ID from result.
     * @param id to id ,eg: 1
     */

    //%block="HuskyLens get $number1 of ID $id arrow from the result"
    //% weight=60
    export function readeArrow(id: number,number1: Content2): number {
        let hk_y = cycle_arrow(id, 1);
        let hk_x
        if (countArrows(id) != 0) {
            if (hk_y != null) {

                switch (number1) {
                    case 1:
                        hk_x = protocolPtr[hk_y][1]; break;
                    case 2:
                        hk_x = protocolPtr[hk_y][2]; break;
                    case 3:
                        hk_x = protocolPtr[hk_y][3]; break;
                    case 4:
                        hk_x = protocolPtr[hk_y][4]; break;
                    default:
                        hk_x = -1;
                }
            }
            else hk_x = -1;
        }
        else hk_x = -1;
        return hk_x;
    }
    /**
     * HuskyLens get the box or arrow total number from result.
     * 
     */
    //%block="HuskyLens get a total number of %Httotal from the result"
    //% weight=90
    //% advanced=true
    export function getBox(Ht: HUSKYLENSResultType_t): number {
        switch (Ht) {
            case 1:
                return countBlocks_s();
            case 2:
                return countArrows_s();
            default:
                return 0;
        }
    }
    /**
     * HuskyLens get the parameter of Nth box from result.
     * @param index to index ,eg: 1
     */
    //% block="HuskyLens get $data of the No. $index frame from the result"
    //% weight=60
    //% advanced=true
    export function readBox_ss(index: number, data: Content3): number {
        let hk_x = -1
        let hk_i = index - 1
        if (protocolPtr[hk_i][0] == protocolCommand.COMMAND_RETURN_BLOCK) {
            switch (data) {
                case 1:
                    hk_x = protocolPtr[hk_i][1]; break;
                case 2:
                    hk_x = protocolPtr[hk_i][2]; break;
                case 3:
                    hk_x = protocolPtr[hk_i][3]; break;
                case 4:
                    hk_x = protocolPtr[hk_i][4]; break;
                default:
                    hk_x = protocolPtr[hk_i][5];
            }
        } else hk_x = -1;
        return hk_x;
        
    }
    /**
     * HuskyLens get the parameter of the Nth arrow from result.
     * @param index to index ,eg: 1
    */
    //% block="HuskyLens get $data of the No. $index arrow from the result"
    //% weight=60
    //% advanced=true
    export function readArrow_ss(index: number, data: Content4): number {
        let hk_x
        let hk_i = index - 1
        if (protocolPtr[hk_i][0] == protocolCommand.COMMAND_RETURN_ARROW) {
            switch (data) {
                case 1:
                    hk_x = protocolPtr[hk_i][1]; break;
                case 2:
                    hk_x = protocolPtr[hk_i][2]; break;
                case 3:
                    hk_x = protocolPtr[hk_i][3]; break;
                case 4:
                    hk_x = protocolPtr[hk_i][4]; break;
                default:
                    hk_x = protocolPtr[hk_i][5];
            }
        } else hk_x = -1;
        //protocolPtr[hk_i][0] = 0;
        return hk_x;
    }
    /**
     * HuskyLens get the total number of box or arrow from result.
     * @param id to id ,eg: 1
     */
    //%block="HuskyLens get a total number of ID %id %Httotal from the result"
    //% weight=55
    //% advanced=true
    export function getBox_S(id: number, Ht: HUSKYLENSResultType_t): number {
        switch (Ht) {
            case 1:
                return countBlocks(id);
            case 2:
                return countArrows(id);
            default:
                return 0;
        }
    }
    /**
     * HuskyLens get the parameter of the Nth box corresponding to ID from result.
     * @param id to id ,eg: 1
     * @param index to index ,eg: 1
     */
    //%block="HuskyLens get $number1 of the ID $id  No. $index frame from the result"
    //% weight=45
    //% advanced=true
    export function readeBox_index(id: number, index: number, number1: Content1): number {
        let hk_y = cycle_block(id, index);
        let hk_x
        if (countBlocks(id) != 0) {
            if (hk_y != null) {
                switch (number1) {
                    case 1:
                        hk_x = protocolPtr[hk_y][1]; break;
                    case 2:
                        hk_x = protocolPtr[hk_y][2]; break;
                    case 3:
                        hk_x = protocolPtr[hk_y][3]; break;
                    case 4:
                        hk_x = protocolPtr[hk_y][4]; break;
                    default:
                        hk_x = -1;
                }
            }
            else hk_x = -1;
        }
        else hk_x = -1;
        return hk_x;
    }
    /**
     * HuskyLens get the parameter of the Nth arrow corresponding to ID from result.
     * @param id to id ,eg: 1
     * @param index to index ,eg: 1
     */
    //%block="HuskyLens get $number1 of the ID $id No. $index arrow from the result"
    //% weight=35
    //% advanced=true
    export function readeArrow_index(index: number, id: number, number1: Content2): number {
        let hk_y = cycle_arrow(id, index);
        let hk_x
        if (countArrows(id) != 0) {
            if (hk_y != null) {
                switch (number1) {
                    case 1:
                        hk_x = protocolPtr[hk_y][1]; break;
                    case 2:
                        hk_x = protocolPtr[hk_y][2]; break;
                    case 3:
                        hk_x = protocolPtr[hk_y][3]; break;
                    case 4:
                        hk_x = protocolPtr[hk_y][4]; break;
                    default:
                        hk_x = -1;
                }
            }
            else hk_x = -1;
        }
        else hk_x = -1;
        return hk_x;
    }
    /**
     * Huskylens automatic learning ID
     * @param id to id ,eg: 1
     */
    //%block="HuskyLens learn ID %id once automatically"
    //% weight=30
    //% advanced=true
    export function writeLearn1(id: number):void{
        writeAlgorithm(id, 0X36)
        //while(!wait(protocolCommand.COMMAND_RETURN_OK));
    }
    /**
     * Huskylens forget all learning data of the current algorithm
     */
    //%block="HuskyLens forget all learning data of the current algorithm"
    //% weight=29
    //% advanced=true
    export function forgetLearn():void{
        writeAlgorithm(0x47, 0X37)
        //while(!wait(protocolCommand.COMMAND_RETURN_OK));
    }
    /**
     * Set ID name
     * @param id to id ,eg: 1
     * @param name to name ,eg: "DFRobot"
     */
    //%block="HuskyLens name ID %id of the current algorithm as %name"
    //% weight=28
    //% advanced=true
    export function writeName(id:number,name:string):void{
        //do{
            let newname = name;
            let buffer = husky_lens_protocol_write_begin(0x2f);
            send_buffer[send_index] = id;
            send_buffer[send_index+1] = (newname.length + 1) * 2;
            send_index += 2;
            for(let i=0;i<newname.length;i++){
                send_buffer[send_index] = newname.charCodeAt(i);
                //serial.writeNumber(newname.charCodeAt(i))
                send_index ++;
            }
            send_buffer[send_index]=0;
            send_index += 1;
            let length = husky_lens_protocol_write_end();
            let Buffer = pins.createBufferFromArray(buffer);
            protocolWrite(Buffer);
        //}while(!wait(protocolCommand.COMMAND_RETURN_OK));
    }
    /**
     * Display characters on the screen
     * @param name to name ,eg: "DFRobot"
     * @param x to x ,eg: 150
     * @param y to y ,eg: 30
     */
    //%block="HuskyLens show custom texts %name at position x %x y %y on screen"
    //% weight=27
    //% advanced=true
    //% x.min=0 x.max=319
    //% y.min=0 y.max=210
    export function writeOSD(name:string, x:number, y:number):void{
        //do{
            let buffer = husky_lens_protocol_write_begin(0x34);
            send_buffer[send_index] = name.length;
            if(x>255){
                send_buffer[send_index+2] = (x%255);
                send_buffer[send_index+1] = 0xff;
            }else{
                 send_buffer[send_index+1] = 0;
                send_buffer[send_index+2] = x;
            }
            send_buffer[send_index+3] = y;
            send_index += 4;
            for(let i=0;i<name.length;i++){
                send_buffer[send_index] = name.charCodeAt(i);
                //serial.writeNumber(name.charCodeAt(i));
                send_index ++;
            }
            let length = husky_lens_protocol_write_end();
            //serial.writeNumber(length)
            let Buffer = pins.createBufferFromArray(buffer);
            protocolWrite(Buffer);
        //}while(!wait(protocolCommand.COMMAND_RETURN_OK));
    }
    /**
     * HuskyLens clear characters in the screen
     */
    //%block="HuskyLens clear all custom texts on screen"
    //% weight=26
    //% advanced=true
    export function clearOSD():void{
        writeAlgorithm(0x45, 0X35);
        //while(!wait(protocolCommand.COMMAND_RETURN_OK));
    }
    /**
     * Photos and screenshots
     */
    //%block="HuskyLens take %request and save to SD card"
    //% weight=25
    //% advanced=true
    export function takePhotoToSDCard(request:HUSKYLENSphoto):void{
        switch(request){
        case HUSKYLENSphoto.PHOTO:
            writeAlgorithm(0x40, 0X30)
            //while(!wait(protocolCommand.COMMAND_RETURN_OK))
            break;
        case HUSKYLENSphoto.SCREENSHOT:
            writeAlgorithm(0x49, 0X39)
            //while(!wait(protocolCommand.COMMAND_RETURN_OK));
            break;
        default:
            writeAlgorithm(0x40, 0X30)
            //while(!wait(protocolCommand.COMMAND_RETURN_OK));
        } 
        basic.pause(500)
    }
    /**
     * Save data model
     */
    //%block="HuskyLens %command current algorithm data as No. %data model of SD card"
    //% weight=24
    //% advanced=true
    //% data.min=0 data.max=5
    export function saveModelToTFCard(command:HUSKYLENSMode,data:number):void{
       switch(command){
       case HUSKYLENSMode.SAVE:
            writeAlgorithm(data,0x32);
            //while(!wait(protocolCommand.COMMAND_RETURN_OK));
            break;
        case HUSKYLENSMode.LOAD:
            writeAlgorithm(data,0x33);
            //while(!wait(protocolCommand.COMMAND_RETURN_OK));
            break;
        default:
            writeAlgorithm(data,0x32);
            //while(!wait(protocolCommand.COMMAND_RETURN_OK));
       }
       basic.pause(500)
    }

    function validateCheckSum() {

        let stackSumIndex = receive_buffer[3] + CONTENT_INDEX;
        let hk_sum = 0;
        for (let i = 0; i < stackSumIndex; i++) {
            hk_sum += receive_buffer[i];
        }
        hk_sum = hk_sum & 0xff;

        return (hk_sum == receive_buffer[stackSumIndex]);
    }

    function husky_lens_protocol_write_end() {
        if (send_fail) { return 0; }
        if (send_index + 1 >= FRAME_BUFFER_SIZE) { return 0; }
        send_buffer[CONTENT_SIZE_INDEX] = send_index - CONTENT_INDEX;
        //serial.writeValue("618", send_buffer[CONTENT_SIZE_INDEX])
        let hk_sum = 0;
        for (let i = 0; i < send_index; i++) {
            hk_sum += send_buffer[i];
        }

        hk_sum = hk_sum & 0xff;
        send_buffer[send_index] = hk_sum;
        send_index++;
        return send_index;
    }
    
    function husky_lens_protocol_write_begin(command = 0) {
        send_fail = false;
        send_buffer[HEADER_0_INDEX] = 0x55;
        send_buffer[HEADER_1_INDEX] = 0xAA;
        send_buffer[ADDRESS_INDEX] = 0x11;
        //send_buffer[CONTENT_SIZE_INDEX] = datalen;
        send_buffer[COMMAND_INDEX] = command;
        send_index = CONTENT_INDEX;
        return send_buffer;
    }
    
    function protocolWrite(buffer: Buffer) {
        pins.i2cWriteBuffer(0x32, buffer, false);
        basic.pause(50)
    }

    function processReturn() {
        if (!wait(protocolCommand.COMMAND_RETURN_INFO)) return false;
        protocolReadFiveInt16(protocolCommand.COMMAND_RETURN_INFO);
        for (let i = 0; i < Protocol_t[1]; i++) {
           
            if (!wait()) return false;
            if (protocolReadFiveInt161(i, protocolCommand.COMMAND_RETURN_BLOCK)) continue;
            else if (protocolReadFiveInt161(i, protocolCommand.COMMAND_RETURN_ARROW)) continue;
            else return false;
        }
        return true;
    }   

    function wait(command = 0) {
        timerBegin();
        while(!timerAvailable()) {
            if (protocolAvailable()) {
                if (command) {
                    if (husky_lens_protocol_read_begin(command)) {
                        //serial.writeNumber(0);
                        return true;
                    }
                }
                else {
                    return true;
                }
            }else{
                return false;
            }
        }
        return false;
    }
    
    function husky_lens_protocol_read_begin(command = 0) {
        if (command == receive_buffer[COMMAND_INDEX]) {
            content_current = CONTENT_INDEX;
            content_read_end = false;
            receive_fail = false;
            return true;
        }
        return false;
    }
    
    let timeOutDuration = 100;
    let timeOutTimer: number
    function timerBegin() {
        timeOutTimer = input.runningTime();
    }
    
    function timerAvailable() {
        return (input.runningTime() - timeOutTimer > timeOutDuration);
    }
    
    let m_i = 16
    function protocolAvailable() {
        let buf = pins.createBuffer(16)
        if (m_i == 16) {
            buf = pins.i2cReadBuffer(0x32, 16, false);
            m_i = 0;
        }
        for (let i = m_i; i < 16; i++) {
            if (husky_lens_protocol_receive(buf[i])) {
                m_i++;
                return true;
            }
            m_i++;
        }
        return false
    }
    
    function husky_lens_protocol_receive(data: number): boolean {
        switch (receive_index) {
            case HEADER_0_INDEX:
                if (data != 0x55) { receive_index = 0; return false; }
                receive_buffer[HEADER_0_INDEX] = 0x55;
                break;
            case HEADER_1_INDEX:
                if (data != 0xAA) { receive_index = 0; return false; }
                receive_buffer[HEADER_1_INDEX] = 0xAA;
                break;
            case ADDRESS_INDEX:
                receive_buffer[ADDRESS_INDEX] = data;
                break;
            case CONTENT_SIZE_INDEX:
                if (data >= FRAME_BUFFER_SIZE - PROTOCOL_SIZE) { receive_index = 0; return false; }
                receive_buffer[CONTENT_SIZE_INDEX] = data;
                break;
            default:
                receive_buffer[receive_index] = data;

                if (receive_index == receive_buffer[CONTENT_SIZE_INDEX] + CONTENT_INDEX) {
                    content_end = receive_index;
                    receive_index = 0;
                    return validateCheckSum();

                }
                break;
        }
        receive_index++;
        return false;
    }

    function husky_lens_protocol_write_int16(content = 0) {

        let x: number = ((content.toString()).length)
        if (send_index + x >= FRAME_BUFFER_SIZE) { send_fail = true; return; }
        send_buffer[send_index] = content & 0xff;
        send_buffer[send_index + 1] = (content >> 8) & 0xff;
        send_index += 2;
    }
    
    function protocolReadFiveInt16(command = 0) {
        if (husky_lens_protocol_read_begin(command)) {
            Protocol_t[0] = command;
            Protocol_t[1] = husky_lens_protocol_read_int16();
            Protocol_t[2] = husky_lens_protocol_read_int16();
            Protocol_t[3] = husky_lens_protocol_read_int16();
            Protocol_t[4] = husky_lens_protocol_read_int16();
            Protocol_t[5] = husky_lens_protocol_read_int16();
            husky_lens_protocol_read_end();
            return true;
        }
        else {
            return false;
        }
    }
    
    function protocolReadFiveInt161(i: number, command = 0) {
        if (husky_lens_protocol_read_begin(command)) {
            protocolPtr[i][0] = command;
            protocolPtr[i][1] = husky_lens_protocol_read_int16();
            protocolPtr[i][2] = husky_lens_protocol_read_int16();
            protocolPtr[i][3] = husky_lens_protocol_read_int16();
            protocolPtr[i][4] = husky_lens_protocol_read_int16();
            protocolPtr[i][5] = husky_lens_protocol_read_int16();
            husky_lens_protocol_read_end();
            return true;
        }
        else {
            return false;
        }
    }

    function husky_lens_protocol_read_int16() {
        if (content_current >= content_end || content_read_end) { receive_fail = true; return 0; }
        let result = receive_buffer[content_current + 1] << 8 | receive_buffer[content_current];
        content_current += 2
        return result;
    }
    
    function husky_lens_protocol_read_end() {
        if (receive_fail) {
            receive_fail = false;
            return false;
        }
        return content_current == content_end;
    }
     
    function countLearnedIDs() {
        return Protocol_t[2]
    }
    
    function countBlocks(ID: number) {
        let counter = 0;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_BLOCK && protocolPtr[i][5] == ID) counter++;
        }
        return counter;
    }
    
    function countBlocks_s() {
        let counter = 0;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_BLOCK) counter++;
        }
        //serial.writeNumber(counter)
        return counter;
    }
    
    function countArrows(ID: number) {
        let counter = 0;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_ARROW && protocolPtr[i][5] == ID) counter++;
        }
        return counter;
    }
    
    function countArrows_s() {
        let counter = 0;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_ARROW) counter++;
        }
        return counter;
    }
    
    function readKnock() {
        for (let i = 0; i < 5; i++) {
            protocolWriteCommand(protocolCommand.COMMAND_REQUEST_KNOCK);//I2C
            if (wait(protocolCommand.COMMAND_RETURN_OK)) {
                return true;
            }
        }
        return false;
    }

    function writeForget() {
        for (let i = 0; i < 5; i++) {
            protocolWriteCommand(protocolCommand.COMMAND_REQUEST_FORGET);
            if (wait(protocolCommand.COMMAND_RETURN_OK)) {
                return true;
            }
        }
        return false;
    }
    
    function protocolWriteCommand(command = 0) {
        Protocol_t[0] = command;
        let buffer = husky_lens_protocol_write_begin(Protocol_t[0]);
        let length = husky_lens_protocol_write_end();
        let Buffer = pins.createBufferFromArray(buffer);
        protocolWrite(Buffer);
    }
    
    function protocolReadCommand(command = 0) {
        if (husky_lens_protocol_read_begin(command)) {
            Protocol_t[0] = command;
            husky_lens_protocol_read_end();
            return true;
        }
        else {
            return false;
        }
    }
    
    function writeAlgorithm(algorithmType : number,comemand = 0){
        protocolWriteOneInt16(algorithmType, comemand);
        //return true//wait(protocolCommand.COMMAND_RETURN_OK);
        //while(!wait(protocolCommand.COMMAND_RETURN_OK));
        //return true
    }

    function writeLearn(algorithmType: number) {
        protocolWriteOneInt16(algorithmType, protocolCommand.COMMAND_REQUEST_LEARN);
        return wait(protocolCommand.COMMAND_RETURN_OK);
    }

    function protocolWriteOneInt16(algorithmType: number, command = 0) {
        let buffer = husky_lens_protocol_write_begin(command);
        husky_lens_protocol_write_int16(algorithmType);
        let length = husky_lens_protocol_write_end();
        let Buffer = pins.createBufferFromArray(buffer);
        protocolWrite(Buffer);
    }

    function cycle_block(ID: number, index = 1): number {
        let counter = 0;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_BLOCK && protocolPtr[i][5] == ID) {
                counter++;
                if (index == counter) return i;

            }
        }
        return null;
    }
    
    function cycle_arrow(ID: number, index = 1): number {
        let counter = 0;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_ARROW && protocolPtr[i][5] == ID) {
                counter++;
                if (index == counter) return i;

            }
        }
        return null;
    }

    function readBlockCenterParameterDirect(): number {
        let distanceMinIndex = -1;
        let distanceMin = 65535;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_BLOCK) {
                let distance = Math.round(Math.sqrt(Math.abs(protocolPtr[i][1] - 320 / 2))) + Math.round(Math.sqrt(Math.abs(protocolPtr[i][2] - 240 / 2)));
                if (distance < distanceMin) {
                    distanceMin = distance;
                    distanceMinIndex = i;
                }
            }
        }
        return distanceMinIndex
    }

    function readArrowCenterParameterDirect(): number {
        let distanceMinIndex = -1;
        let distanceMin = 65535;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_ARROW) {
                let distance = Math.round(Math.sqrt(Math.abs(protocolPtr[i][1] - 320 / 2))) + Math.round(Math.sqrt(Math.abs(protocolPtr[i][2] - 240 / 2)));
                if (distance < distanceMin) {
                    distanceMin = distance;
                    distanceMinIndex = i;
                }
            }
        }
        return distanceMinIndex
    }

    function no():void
    {
        basic.showIcon(IconNames.No);
        basic.pause(100);
        basic.clearScreen();
        basic.pause(100);
    }
    function yes():void
    {
        basic.showIcon(IconNames.Yes);
        basic.pause(100);
        basic.clearScreen();
    }
    
    
}

//% color="#C814B8" weight=25 icon="\uf1d4"
namespace CUHK_JC_iCar_Display {

    export enum enColor {

        //% blockId="OFF" block="Off"
        OFF = 0,
        //% blockId="Red" block="Red"
        Red,
        //% blockId="Green" block="Green"
        Green,
        //% blockId="Blue" block="Blue"
        Blue,
        //% blockId="White" block="White"
        White,
        //% blockId="Cyan" block="Cyan"
        Cyan,
        //% blockId="Pinkish" block="Pinkish"
        Pinkish,
        //% blockId="Yellow" block="Yellow"
        Yellow,

    }
    export enum enLED1 {
        
        //% blockId="OFF" block="Off"
        OFF = 0,
        //% blockId="ON" block="On"
        ON =1
    }

    //% blockId=mbit_LED1 block="LED1|pin %pin|value %value"
    //% weight=5
    //% blockGap=8
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=1
    export function LED1(pin: DigitalPin, value: enLED1): void {

        pins.digitalWritePin(pin, value);

    }

    //% blockId=mbit_LED2 block="LED2|pin %pin|value %value"
    //% weight=4
    //% blockGap=8
    //% color="#C814B8"
    //% value.min=0 value.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=2
    export function LED2(pin: AnalogPin, value: number): void {

        pins.analogWritePin(pin, value * 1024 / 256);

    }

    //% blockId=mbit_BreathLED block="BreathLED|pin %pin"
    //% weight=3
    //% blockGap=8
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=3
    export function BreathLED(pin: AnalogPin): void {

        for (let i: number = 0; i < 1023; i++) {
            pins.analogWritePin(pin, i);
            //basic.pause(1);
            control.waitMicros(1000);
        }
        basic.pause(10);
        for (let i: number = 1023; i > 0; i--) {
            pins.analogWritePin(pin, i);
            //basic.pause(1);
            control.waitMicros(1000);
        }

    }

    //% blockId=mbit_RGB block="RGB|pin1 %pin1|pin2 %pin2|pin3 %pin3|value1 %value1|value2 %value2|value3 %value3"
    //% weight=2
    //% blockGap=8
    //% color="#C814B8"
    //% value1.min=0 value1.max=255 value2.min=0 value2.max=255 value3.min=0 value3.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function RGB(pin1: AnalogPin, pin2: AnalogPin, pin3: AnalogPin, value1: number, value2: number, value3: number): void {

        pins.analogWritePin(pin1, value1 * 1024 / 256);
        pins.analogWritePin(pin2, value2 * 1024 / 256);
        pins.analogWritePin(pin3, value3 * 1024 / 256);

    }
    //% blockId=mbit_RGB2 block="RGB|pin1 %pin1|pin2 %pin2|pin3 %pin3|value %value"
    //% weight=1
    //% blockGap=8
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function RGB2(pin1: DigitalPin, pin2: DigitalPin, pin3: DigitalPin, value: enColor): void {

        switch (value) {
            case enColor.OFF: {
                pins.digitalWritePin(pin1, 0);
                pins.digitalWritePin(pin2, 0);
                pins.digitalWritePin(pin3, 0);
                break;
            }
            case enColor.Red: {
                pins.digitalWritePin(pin1, 1);
                pins.digitalWritePin(pin2, 0);
                pins.digitalWritePin(pin3, 0);
                break;
            }
            case enColor.Green: {
                pins.digitalWritePin(pin1, 0);
                pins.digitalWritePin(pin2, 1);
                pins.digitalWritePin(pin3, 0);
                break;
            }
            case enColor.Blue: {
                pins.digitalWritePin(pin1, 0);
                pins.digitalWritePin(pin2, 0);
                pins.digitalWritePin(pin3, 1);
                break;
            }
            case enColor.White: {
                pins.digitalWritePin(pin1, 1);
                pins.digitalWritePin(pin2, 1);
                pins.digitalWritePin(pin3, 1);
                break;
            }
            case enColor.Cyan: {
                pins.digitalWritePin(pin1, 0);
                pins.digitalWritePin(pin2, 1);
                pins.digitalWritePin(pin3, 1);
                break;
            }
            case enColor.Pinkish: {
                pins.digitalWritePin(pin1, 1);
                pins.digitalWritePin(pin2, 0);
                pins.digitalWritePin(pin3, 1);
                break;
            }
            case enColor.Yellow: {
                pins.digitalWritePin(pin1, 1);
                pins.digitalWritePin(pin2, 1);
                pins.digitalWritePin(pin3, 0);
                break;
            }
        }

    }
   
}
/*****************************************************************************************************************************************
 *  Sensors  ***************************************************************************************************************************** 
 ****************************************************************************************************************************************/

//% color="#87CEEB" weight=24 icon="\uf1b6"
namespace CUHK_JC_iCar_Sensors {

    export enum enVoice {
        //% blockId="Voice" block="Voice"
        Voice = 0,
        //% blockId="NoVoice" block="NoVoice"
        NoVoice = 1
    }

    export enum enIR {
        //% blockId="Get" block="Detected"
        Get = 0,
        //% blockId="NoVoice" block="Undetected"
        NoGet = 1
    }
    

    //% blockId=mbit_Voice_Sensor block="Voice_Sensor|pin %pin|value %value"
    //% weight=100
    //% blockGap=10
    //% color="#87CEEB"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Voice_Sensor(pin: DigitalPin, value: enVoice): boolean {

        pins.setPull(pin, PinPullMode.PullUp);
        if (pins.digitalReadPin(pin) == value) {
            return true;
        }
        else {
            return false;
        }

    }

    function IR_send_38k() {
        for (let i: number = 0; i < 8; i++) {
            pins.digitalWritePin(DigitalPin.P9, 1);
            control.waitMicros(13);
            pins.digitalWritePin(DigitalPin.P9, 0);
            control.waitMicros(13);
        }
    }
    //% blockId=mbit_IR_Sensor block="IR_Sensor|pin %pin| |%value|blockade"
    //% weight=100
    //% blockGap=10
    //% color="#87CEEB"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function IR_Sensor(pin: DigitalPin, value: enIR): boolean {

        pins.setPull(pin, PinPullMode.PullUp);
        //IR_send_38k();
        if (pins.digitalReadPin(pin) == value) {
            return true;
        }
        else {
            return false;
        }

    }

    //% blockId=mbit_IR_Send block="IR_Send|pin %pin"
    //% weight=100
    //% blockGap=10
    //% color="#87CEEB"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function IR_Send(pin: DigitalPin): void {

        
        IR_send_38k();

    }
   
    //% blockId=mbit_ultrasonic block="Ultrasonic|Trig %Trig|Echo %Echo"
    //% color="#87CEEB"
    //% weight=100
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Ultrasonic(Trig: DigitalPin, Echo: DigitalPin): number {

        // send pulse

        let list:Array<number> = [0, 0, 0, 0, 0];
        for (let i = 0; i < 5; i++) {
            pins.setPull(Trig, PinPullMode.PullNone);
            pins.digitalWritePin(Trig, 0);
            control.waitMicros(2);
            pins.digitalWritePin(Trig, 1);
            control.waitMicros(15);
            pins.digitalWritePin(Trig, 0);
    
            let d = pins.pulseIn(Echo, PulseValue.High, 43200);
            list[i] = Math.floor(d / 40)
        }
        list.sort();
        let length = (list[1] + list[2] + list[3])/3;
        return  Math.floor(length);
    }
}

/*****************************************************************************************************************************************
 *  Inputs *****************************************************************************************************************************
 ****************************************************************************************************************************************/

//% color="#808080" weight=23 icon="\uf11c"
namespace CUHK_JC_iCar_Inputs {

    export enum enRocker {
        //% blockId="Nostate" block="No"
        Nostate = 0,
        //% blockId="Up" block="Up"
        Up,
        //% blockId="Down" block="Down"
        Down,
        //% blockId="Left" block="Left"
        Left,
        //% blockId="Right" block="Right"
        Right,
        //% blockId="Press" block="Pressed"
        Press
    }

    export enum enTouch {
        //% blockId="NoTouch" block="Untouched"
        NoTouch = 0,
        //% blockId="Touch" block="Touched"
        Touch = 1
    }
    export enum enButton {
        //% blockId="Press" block="Pressed"
        Press = 0,
        //% blockId="Realse" block="Released"
        Realse = 1
    }

    //% blockId=mbit_TouchPad block="TouchPad|pin %pin|value %value"
    //% weight=100
    //% blockGap=10
    //% color="#808080"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=5
    export function TouchPad(pin: DigitalPin, value: enTouch): boolean {

        pins.setPull(pin, PinPullMode.PullUp);
        if (pins.digitalReadPin(pin) == value) {
            return true;
        }
        else {
            return false;
        }

    }
    
    //% blockId=mbit_Rocker block="Rocker|VRX %pin1|VRY %pin2|SW %pin3|value %value"
    //% weight=100
    //% blockGap=10
    //% color="#808080"
    export function Rocker(pin1: AnalogPin, pin2: AnalogPin, pin3: DigitalPin, value: enRocker): boolean {

        pins.setPull(pin3, PinPullMode.PullUp);
        let x = pins.analogReadPin(pin1);
        let y = pins.analogReadPin(pin2);
        let z = pins.digitalReadPin(pin3);
        let now_state = enRocker.Nostate;

        if (x < 100) // Up
        {

            now_state = enRocker.Up;

        }
        else if (x > 700) //
        {

            now_state = enRocker.Down;
        }
        else  // LeftRight
        {
            if (y < 100) //Right
            {
                now_state = enRocker.Right;
            }
            else if (y > 700) //Left
            {
                now_state = enRocker.Left;
            }
        }
        if (z == 0)
            now_state = enRocker.Press;
        if (now_state == value)
            return true;
        else
            return false;

    }

    //% blockId=mbit_Button block="Button|pin %pin|value %value"
    //% weight=100
    //% blockGap=10
    //% color="#808080"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=5
    export function Button(pin: DigitalPin, value: enButton): boolean {

        pins.setPull(pin, PinPullMode.PullUp);
        if (pins.digitalReadPin(pin) == value) {
            return true;
        }
        else {
            return false;
        }

    }  
}

/*****************************************************************************************************************************************
 *    Sounds *****************************************************************************************************************************
 ****************************************************************************************************************************************/

//% color="#D2691E" weight=22 icon="\uf001"
namespace CUHK_JC_iCar_Sounds {
    export enum enBuzzer {

        //% blockId="NoBeep" block="Unbeeped"
        NoBeep = 0,
        //% blockId="Beep" block="Beeped"
        Beep
    }

    //% blockId=mbit_Buzzer block="Buzzer|pin %pin|value %value"
    //% weight=100
    //% blockGap=10 
    //% color="#D2691E"
    //% value.min=0 value.max=1
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=8
    export function Buzzer(pin: DigitalPin, value: enBuzzer): void {

        pins.setPull(pin, PinPullMode.PullNone);
        pins.digitalWritePin(pin, value);

    }

}

/*****************************************************************************************************************************************
 *    Motors *****************************************************************************************************************************
 ****************************************************************************************************************************************/

//% color="#0000CD" weight=21 icon="\uf185"
namespace CUHK_JC_iCar_Motors {

    //% blockId=mbit_Fan block="Fan|pin %pin|speed %value"
    //% weight=100
    //% blockGap=10
    //% color="#0000CD"
    //% value.min=0 value.max=1023
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=9
    export function Fan(pin: AnalogPin, value: number): void {

        pins.analogWritePin(pin, value);

    }

    //% blockId=mbit_Servo block="Servo|pin %pin|value %value"
    //% weight=100
    //% blockGap=10
    //% color="#0000CD"
    //% value.min=0 value.max=180
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=9
    export function Servo(pin: AnalogPin, value: number): void {

        pins.servoWritePin(pin, value);

    }

}

//% color="#006400" weight=20 icon="\uf1b9"
namespace CUHK_JC_iCar_Vehicle {

    const PCA9685_ADD = 0x41
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04

    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09

    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD

    const PRESCALE = 0xFE

    let initialized = false
    let yahStrip: neopixel.Strip;

    export enum enColor {

        //% blockId="OFF" block="Off"
        OFF = 0,
        //% blockId="Red" block="Red"
        Red,
        //% blockId="Green" block="Green"
        Green,
        //% blockId="Blue" block="Blue"
        Blue,
        //% blockId="White" block="White"
        White,
        //% blockId="Cyan" block="Cyan"
        Cyan,
        //% blockId="Pinkish" block="Pinkish"
        Pinkish,
        //% blockId="Yellow" block="Yellow"
        Yellow,

    }
    export enum enMusic {

        dadadum = 0,
        entertainer,
        prelude,
        ode,
        nyan,
        ringtone,
        funk,
        blues,

        birthday,
        wedding,
        funereal,
        punchline,
        baddy,
        chase,
        ba_ding,
        wawawawaa,
        jump_up,
        jump_down,
        power_up,
        power_down
    }
    export enum enPos {

        //% blockId="LeftState" block="LeftStatus"
        LeftState = 0,
        //% blockId="RightState" block="RightStatus"
        RightState = 1
    }

    export enum enLineState {
        //% blockId="White" block="WhiteLine"
        White = 0,
        //% blockId="Black" block="BlackLine"
        Black = 1

    }
    
    export enum enAvoidState {
        //% blockId="OBSTACLE" block="Blocked"
        OBSTACLE = 0,
        //% blockId="NOOBSTACLE" block="Unblocked"
        NOOBSTACLE = 1

    }

    
    export enum enServo {
        
        S1 = 1,
        S2,
        S3
    }
    export enum CarState {
        //% blockId="Car_Run" block="Forward"
        Car_Run = 1,
        //% blockId="Car_Back" block="Backward"
        Car_Back = 2,
        //% blockId="Car_Left" block="TurnLeft"
        Car_Left = 3,
        //% blockId="Car_Right" block="TurnRight"
        Car_Right = 4,
        //% blockId="Car_Stop" block="Stop"
        Car_Stop = 5,
        //% blockId="Car_SpinLeft" block="SpinLeft"
        Car_SpinLeft = 6,
        //% blockId="Car_SpinRight" block="SpinRight"
        Car_SpinRight = 7
    }

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2ccmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADD, MODE1, 0x00)
        setFreq(50);
        initialized = true
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADD, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(PCA9685_ADD, MODE1, newmode); // go to sleep
        i2cwrite(PCA9685_ADD, PRESCALE, prescale); // set the prescaler
        i2cwrite(PCA9685_ADD, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADD, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;
        if (!initialized) {
            initPCA9685();
        }
        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADD, buf);
    }


    function Car_run(speed1: number, speed2: number) {

        speed1 = speed1 * 16; // map 350 to 4096
        speed2 = speed2 * 16;
        if (speed1 >= 4096) {
            speed1 = 4095
        }
        if (speed2 >= 4096) {
            speed2 = 4095
        }

        setPwm(12, 0, speed1);
        setPwm(13, 0, 0);

        setPwm(15, 0, speed2);
        setPwm(14, 0, 0);
        //pins.digitalWritePin(DigitalPin.P16, 1);
       // pins.analogWritePin(AnalogPin.P1, 1023-speed); //SpeedControl

       // pins.analogWritePin(AnalogPin.P0, speed);//SpeedControl
       // pins.digitalWritePin(DigitalPin.P8, 0);
    }

    function Car_back(speed1: number, speed2: number) {

        speed1 = speed1 * 16; // map 350 to 4096
        speed2 = speed2 * 16;
        if (speed1 >= 4096) {
            speed1 = 4095
        }
        if (speed2 >= 4096) {
            speed2 = 4095
        }
        setPwm(12, 0, 0);
        setPwm(13, 0, speed1);

        setPwm(15, 0, 0);
        setPwm(14, 0, speed2);

        //pins.digitalWritePin(DigitalPin.P16, 0);
        //pins.analogWritePin(AnalogPin.P1, speed); //SpeedControl

        //pins.analogWritePin(AnalogPin.P0, 1023 - speed);//SpeedControl
        //pins.digitalWritePin(DigitalPin.P8, 1);
    }

    function Car_left(speed1: number, speed2: number) {

        speed1 = speed1 * 16; // map 350 to 4096
        speed2 = speed2 * 16;
        if (speed1 >= 4096) {
            speed1 = 4095
        }
        if (speed2 >= 4096) {
            speed2 = 4095
        }
        
        setPwm(12, 0, speed1);
        setPwm(13, 0, 0);

        setPwm(15, 0, speed2);
        setPwm(14, 0, 0);

        //pins.analogWritePin(AnalogPin.P0, speed);
        //pins.digitalWritePin(DigitalPin.P8, 0);

        //pins.digitalWritePin(DigitalPin.P16, 0);
        //pins.digitalWritePin(DigitalPin.P1, 0);
    }

    function Car_right(speed1: number, speed2: number) {

        speed1 = speed1 * 16; // map 350 to 4096
        speed2 = speed2 * 16;
        if (speed1 >= 4096) {
            speed1 = 4095
        }
        if (speed2 >= 4096) {
            speed2 = 4095
        }
        
        setPwm(12, 0, speed1);
        setPwm(13, 0, 0);

        setPwm(15, 0, speed2);
        setPwm(14, 0, 0);
        //pins.digitalWritePin(DigitalPin.P0, 0);
        //pins.digitalWritePin(DigitalPin.P8, 0);

        //pins.digitalWritePin(DigitalPin.P16, 1);
       // pins.analogWritePin(AnalogPin.P1, 1023 - speed);
    }

    function Car_stop() {
       
        setPwm(12, 0, 0);
        setPwm(13, 0, 0);

        setPwm(15, 0, 0);
        setPwm(14, 0, 0);
        //pins.digitalWritePin(DigitalPin.P0, 0);
        //pins.digitalWritePin(DigitalPin.P8, 0);
        //pins.digitalWritePin(DigitalPin.P16, 0);
        //pins.digitalWritePin(DigitalPin.P1, 0);
    }

    function Car_spinleft(speed1: number, speed2: number) {

        speed1 = speed1 * 16; // map 350 to 4096
        speed2 = speed2 * 16;
        if (speed1 >= 4096) {
            speed1 = 4095
        }
        if (speed2 >= 4096) {
            speed2 = 4095
        }        
        
        setPwm(12, 0, 0);
        setPwm(13, 0, speed1);

        setPwm(15, 0, speed2);
        setPwm(14, 0, 0);

        //pins.analogWritePin(AnalogPin.P0, speed);
        //pins.digitalWritePin(DigitalPin.P8, 0);

        //pins.digitalWritePin(DigitalPin.P16, 0);
        //pins.analogWritePin(AnalogPin.P1, speed);
    } 

    function Car_spinright(speed1: number, speed2: number) {

        speed1 = speed1 * 16; // map 350 to 4096
        speed2 = speed2 * 16;
        if (speed1 >= 4096) {
            speed1 = 4095
        }
        if (speed2 >= 4096) {
            speed2 = 4095
        }      
        setPwm(12, 0, speed1);
        setPwm(13, 0, 0);

        setPwm(15, 0, 0);
        setPwm(14, 0, speed2);
        //pins.analogWritePin(AnalogPin.P0, 1023-speed);
        //pins.digitalWritePin(DigitalPin.P8, 1);

        //pins.digitalWritePin(DigitalPin.P16, 1);
        //pins.analogWritePin(AnalogPin.P1, 1023-speed);

    }

    /**
     * *****************************************************************
     * @param index
     */
    //% blockId=mbit_RGB_Car_Big2 block="RGB_Car_Big2|value %value"
    //% weight=101
    //% blockGap=10
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function RGB_Car_Big2(value: enColor): void {

        switch (value) {
            case enColor.OFF: {
                setPwm(0, 0, 0);
                setPwm(1, 0, 0);
                setPwm(2, 0, 0);
                break;
            }
            case enColor.Red: {
                setPwm(0, 0, 4095);
                setPwm(1, 0, 0);
                setPwm(2, 0, 0);
                break;
            }
            case enColor.Green: {
                setPwm(0, 0, 0);
                setPwm(1, 0, 4095);
                setPwm(2, 0, 0);
                break;
            }
            case enColor.Blue: {
                setPwm(0, 0, 0);
                setPwm(1, 0, 0);
                setPwm(2, 0, 4095);
                break;
            }
            case enColor.White: {
                setPwm(0, 0, 4095);
                setPwm(1, 0, 4095);
                setPwm(2, 0, 4095);
                break;
            }
            case enColor.Cyan: {
                setPwm(0, 0, 0);
                setPwm(1, 0, 4095);
                setPwm(2, 0, 4095);
                break;
            }
            case enColor.Pinkish: {
                setPwm(0, 0, 4095);
                setPwm(1, 0, 0);
                setPwm(2, 0, 4095);
                break;
            }
            case enColor.Yellow: {
                setPwm(0, 0, 4095);
                setPwm(1, 0, 4095);
                setPwm(2, 0, 0);
                break;
            }
        }
    }
    //% blockId=mbit_RGB_Car_Big block="RGB_Car_Big|value1 %value1|value2 %value2|value3 %value3"
    //% weight=100
    //% blockGap=10
    //% color="#C814B8"
    //% value1.min=0 value1.max=255 value2.min=0 value2.max=255 value3.min=0 value3.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function RGB_Car_Big(value1: number, value2: number, value3: number): void {

        let R = value1 * 16;
        let G = value2 * 16;
        let B = value3 * 16;

        if (R > 4096)
            R = 4095;
        if (G > 4096)
            G = 4095;
        if (B > 4096)
            B = 4095;

        setPwm(0, 0, R);
        setPwm(1, 0, G);
        setPwm(2, 0, B);

    }

    //% blockId=mbit_RGB_Car_Program block="RGB_Car_Program"
    //% weight=99
    //% blockGap=10
    //% color="#C814B8"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function RGB_Car_Program(): neopixel.Strip {
         
        if (!yahStrip) {
            yahStrip = neopixel.create(DigitalPin.P16, 3, NeoPixelMode.RGB);
        }
        return yahStrip;  
    }


	//% blockId=mbit_ultrasonic_car block="ultrasonic return distance(cm)"
    //% color="#006400"
    //% weight=98
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Ultrasonic_Car(): number {

        // send pulse   
        let list:Array<number> = [0, 0, 0, 0, 0];
        for (let i = 0; i < 5; i++) {
            pins.setPull(DigitalPin.P14, PinPullMode.PullNone);
		        pins.digitalWritePin(DigitalPin.P14, 0);
		        control.waitMicros(2);
		        pins.digitalWritePin(DigitalPin.P14, 1);
		        control.waitMicros(15);
		        pins.digitalWritePin(DigitalPin.P14, 0);
		
		        let d = pins.pulseIn(DigitalPin.P15, PulseValue.High, 43200);
		        list[i] = Math.floor(d / 40)
        }
        list.sort();
        let length = (list[1] + list[2] + list[3])/3;
        return  Math.floor(length);
    }

    //% blockId=mbit_Music_Car block="Music_Car|%index"
    //% weight=97
    //% blockGap=10
    //% color="#006400"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Music_Car(index: enMusic): void {
        switch (index) {
            case enMusic.dadadum: music.beginMelody(music.builtInMelody(Melodies.Dadadadum), MelodyOptions.Once); break;
            case enMusic.birthday: music.beginMelody(music.builtInMelody(Melodies.Birthday), MelodyOptions.Once); break;
            case enMusic.entertainer: music.beginMelody(music.builtInMelody(Melodies.Entertainer), MelodyOptions.Once); break;
            case enMusic.prelude: music.beginMelody(music.builtInMelody(Melodies.Prelude), MelodyOptions.Once); break;
            case enMusic.ode: music.beginMelody(music.builtInMelody(Melodies.Ode), MelodyOptions.Once); break;
            case enMusic.nyan: music.beginMelody(music.builtInMelody(Melodies.Nyan), MelodyOptions.Once); break;
            case enMusic.ringtone: music.beginMelody(music.builtInMelody(Melodies.Ringtone), MelodyOptions.Once); break;
            case enMusic.funk: music.beginMelody(music.builtInMelody(Melodies.Funk), MelodyOptions.Once); break;
            case enMusic.blues: music.beginMelody(music.builtInMelody(Melodies.Blues), MelodyOptions.Once); break;
            case enMusic.wedding: music.beginMelody(music.builtInMelody(Melodies.Wedding), MelodyOptions.Once); break;
            case enMusic.funereal: music.beginMelody(music.builtInMelody(Melodies.Funeral), MelodyOptions.Once); break;
            case enMusic.punchline: music.beginMelody(music.builtInMelody(Melodies.Punchline), MelodyOptions.Once); break;
            case enMusic.baddy: music.beginMelody(music.builtInMelody(Melodies.Baddy), MelodyOptions.Once); break;
            case enMusic.chase: music.beginMelody(music.builtInMelody(Melodies.Chase), MelodyOptions.Once); break;
            case enMusic.ba_ding: music.beginMelody(music.builtInMelody(Melodies.BaDing), MelodyOptions.Once); break;
            case enMusic.wawawawaa: music.beginMelody(music.builtInMelody(Melodies.Wawawawaa), MelodyOptions.Once); break;
            case enMusic.jump_up: music.beginMelody(music.builtInMelody(Melodies.JumpUp), MelodyOptions.Once); break;
            case enMusic.jump_down: music.beginMelody(music.builtInMelody(Melodies.JumpDown), MelodyOptions.Once); break;
            case enMusic.power_up: music.beginMelody(music.builtInMelody(Melodies.PowerUp), MelodyOptions.Once); break;
            case enMusic.power_down: music.beginMelody(music.builtInMelody(Melodies.PowerDown), MelodyOptions.Once); break;
        }
    }
    //% blockId=mbit_Servo_Car block="Servo_Car|num %num|value %value"
    //% weight=96
    //% blockGap=10
    //% color="#006400"
    //% num.min=1 num.max=3 value.min=0 value.max=180
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=9
    export function Servo_Car(num: enServo, value: number): void {

        // 50hz: 20,000 us
        let us = (value * 1800 / 180 + 600); // 0.6 ~ 2.4
        let pwm = us * 4096 / 20000;
        setPwm(num + 2, 0, pwm);

    }

    //% blockId=mbit_Avoid_Sensor block="Avoid_Sensor|value %value"
    //% weight=95
    //% blockGap=10
    //% color="#006400"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=12
    export function Avoid_Sensor(value: enAvoidState): boolean {

        let temp: boolean = false;
        pins.setPull(DigitalPin.P9, PinPullMode.PullUp)
        pins.digitalWritePin(DigitalPin.P9, 0);
        control.waitMicros(100);
        switch (value) {
            case enAvoidState.OBSTACLE: {
                serial.writeNumber(pins.analogReadPin(AnalogPin.P3))
                if (pins.analogReadPin(AnalogPin.P3) < 800) {
                
                    temp = true;
                    setPwm(8, 0, 0);
                }
                else {                 
                    temp = false;
                    setPwm(8, 0, 4095);
                }
                break;
            }

            case enAvoidState.NOOBSTACLE: {
                if (pins.analogReadPin(AnalogPin.P3) > 800) {

                    temp = true;
                    setPwm(8, 0, 4095);
                }
                else {
                    temp = false;
                    setPwm(8, 0, 0);
                }
                break;
            }
        }
        pins.digitalWritePin(DigitalPin.P9, 1);
        return temp;

    }
    //% blockId=mbit_Line_Sensor block="Line_Sensor|direct %direct|value %value"
    //% weight=94
    //% blockGap=10
    //% color="#006400"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=12
    export function Line_Sensor(direct: enPos, value: enLineState): boolean {

        let temp: boolean = false;

        switch (direct) {
            case enPos.LeftState: {
                if (pins.analogReadPin(AnalogPin.P2) < 500) {
                    if (value == enLineState.White) {
                        temp = true;
                    }
                    setPwm(7, 0, 4095);
                }
                else {
                    if (value == enLineState.Black) {
                        temp = true;
                    }
                    setPwm(7, 0, 0);
                }
                break;
            }

            case enPos.RightState: {
                if (pins.analogReadPin(AnalogPin.P1) < 500) {
                    if (value == enLineState.White) {
                        temp = true;
                    }
                    setPwm(6, 0, 4095);
                }
                else {
                    if (value == enLineState.Black) {
                        temp = true;
                    }
                    setPwm(6, 0, 0);
                }
                break;
            }
        }
        return temp;

    }
    //% blockId=mbit_CarCtrl block="CarCtrl|%index"
    //% weight=93
    //% blockGap=10
    //% color="#006400"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=10
    export function CarCtrl(index: CarState): void {
        switch (index) {
            case CarState.Car_Run: Car_run(255, 255); break;
            case CarState.Car_Back: Car_back(255, 255); break;
            case CarState.Car_Left: Car_left(0, 255); break;
            case CarState.Car_Right: Car_right(255, 0); break;
            case CarState.Car_Stop: Car_stop(); break;
            case CarState.Car_SpinLeft: Car_spinleft(255, 255); break;
            case CarState.Car_SpinRight: Car_spinright(255, 255); break;
        }
    }
    //% blockId=mbit_CarCtrlSpeed block="CarCtrlSpeed|%index|speed %speed"
    //% weight=92
    //% blockGap=10
    //% speed.min=0 speed.max=255
    //% color="#006400"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=10
    export function CarCtrlSpeed(index: CarState, speed: number): void {
        switch (index) {
            case CarState.Car_Run: Car_run(speed, speed); break;
            case CarState.Car_Back: Car_back(speed, speed); break;
            case CarState.Car_Left: Car_left(0, speed); break;
            case CarState.Car_Right: Car_right(speed, 0); break;
            case CarState.Car_Stop: Car_stop(); break;
            case CarState.Car_SpinLeft: Car_spinleft(speed, speed); break;
            case CarState.Car_SpinRight: Car_spinright(speed, speed); break;
        }
    }
    //% blockId=mbit_CarCtrlSpeed2 block="CarCtrlSpeed2|%index|speed1 %speed1|speed2 %speed2"
    //% weight=91
    //% blockGap=10
    //% speed1.min=0 speed1.max=255 speed2.min=0 speed2.max=255
    //% color="#006400"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=10
    export function CarCtrlSpeed2(index: CarState, speed1: number, speed2: number): void {
        switch (index) {
            case CarState.Car_Run: Car_run(speed1, speed2); break;
            case CarState.Car_Back: Car_back(speed1, speed2); break;
            case CarState.Car_Left: Car_left(0, speed2); break;
            case CarState.Car_Right: Car_right(speed1, 0); break;
            case CarState.Car_Stop: Car_stop(); break;
            case CarState.Car_SpinLeft: Car_spinleft(speed1, speed2); break;
            case CarState.Car_SpinRight: Car_spinright(speed1, speed2); break;
        }
    }
}
