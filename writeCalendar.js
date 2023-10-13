var startTime = new Date(2023, 8, 4);
const CLASSTIME = [
    "8:00-8:50", "9:00-9:50", "10:10-11:00", "11:10-12:00", "13:30-14:20", "14:20-15:10", "15:20-16:10", "16:10-16:50", "18:00-18:50", "19:00-19:50", "20:00-20:50", "21:00-21:50"
];

function date_to_string(date) {
    return date.getFullYear().toString() + (date.getMonth()+1).toString().padStart(2,0) + date.getDate().toString().padStart(2,0)+ "T" + date.getHours().toString().padStart(2,0) + date.getMinutes().toString().padStart(2,0) + date.getSeconds().toString().padStart(2,0);
}

function Class(classname, room) {
    this.classid = classname.substring(0,10);
    this.classname = classname.substring(11);
    this.location = room.split(',')[3];
    
    this.set_start_time = () => {
        var week = room.split(',')[0].split(/(\d+)-(\d+)周/)[1];
        var day = room.split(',')[1].split(/星期(\d)/)[1] - 1;
        var t = new Date(startTime);
        t.setDate(startTime.getDate() + 7*(week-1) + day);
        this.startTime = t;
    };
    
    this.set_end_time = () => {
        var week = room.split(',')[0].split(/(\d+)-(\d+)周/)[2];
        var day = room.split(',')[1].split(/星期(\d)/)[1] - 1;
        var t = new Date(startTime);
        t.setDate(startTime.getDate() + 7*(week-1) + day + 1);
        this.endTime = t;
    };
    this.set_class_start = () => {
        var t = new Date(this.startTime);
        var time = room.split(',')[2].split(/(\d+)-(\d+)节/)[1] - 1;
        t.setHours(startTime.getHours() + (CLASSTIME[time].split('-')[0].split(':')[0])*1);
        t.setMinutes(startTime.getMinutes() + (CLASSTIME[time].split('-')[0].split(':')[1])*1);
        this.classStart = t;
    };
    
    this.set_class_end = () => {
        var t = new Date(this.startTime);
        var time = room.split(',')[2].split(/(\d+)-(\d+)节/)[2] - 1;
        t.setHours(startTime.getHours() + (CLASSTIME[time].split('-')[1].split(':')[0])*1);
        t.setMinutes(startTime.getMinutes() + (CLASSTIME[time].split('-')[1].split(':')[1])*1);
        this.classEnd = t;
    };

    this.init = () => {
        this.set_start_time();
        this.set_end_time();
        this.set_class_start();
        this.set_class_end();
    };
}

function Vcalendar() {
    this.METHOD = "PUBLISH";
    this.VERSION = "2.0";
    this.VEVENT = new Array();
    this.add_vevent = (nevent) => {
        this.VEVENT.push(nevent);
    };
    this.toString = () => {
        var res = "BEGIN:VCALENDAR\n";
        for (let key in this) {
            if (key == "VEVENT") {
                for (let k in this[key]) {
                    res += "BEGIN:VEVENT\n";
                    res += this[key][k];
                    res += "END:VEVENT\n";
                }
            } else if (typeof(this[key]) == "string") {
                res += key + ":" + this[key] + "\n";
            }
        }
        res += "END:VCALENDAR";
        return res;
    };
}

function Vevent(start, end, summary, location, until) {
    this.UID = date_to_string(new Date()) + date_to_string(start) + "@" + "auther";
    this.DTSTART = date_to_string(start);
    this.DTEND = date_to_string(end);
    this.SUMMARY = summary;
    this.LOCATION = location;
    this.RRULE = "FREQ=WEEKLY;UNTIL=" + date_to_string(until);
    this.toString = () => {
        var res = new String();
        for (let key in this) {
            if (typeof(this[key]) == "string") {
                res += key + ":" + this[key] + "\n";
            }
        }
        return res;
    };
}

function to_file(content) {
    var filename = "MyCalendar.ics"
    var blob = new Blob([content], {
        type: "text/plain;charset=utf-8"
    });
    var e = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: 150,
        clientY: 150
    });
    var a = document.createElement("a");
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dispatchEvent(e);
}

function main() {
    var num = $('.mtt_item_kcmc').length;
    var vcalendar = new Vcalendar();
    var classList = new Array();
    for (let i = 0; i < num; i++) {
        var classname = $('.mtt_item_kcmc')[i].innerText;
        var room = $('.mtt_item_room')[i].innerText;
        var infolist = room.split(',');
        var listlen = infolist.length;
        for (let j = 0; j < listlen - 3; j++) {
            if (!(/\d+-\d+周/.test(infolist[j]))) {
                infolist[j] = infolist[j].slice(0,-1) + "-" + infolist[j];
            }
            room = infolist[j] + "," + infolist.slice(listlen-3, listlen);
            var cucclass = new Class(classname, room);
            cucclass.init();
            if (classList.indexOf(cucclass.classid + cucclass.classStart) == -1) {
                classList.push(cucclass.classid + cucclass.classStart);
                var vevent = new Vevent(cucclass.classStart, cucclass.classEnd, cucclass.classname, cucclass.location, cucclass.endTime);
                vcalendar.add_vevent(vevent.toString());
            }
        }
    }
    to_file(vcalendar.toString());
}

main();