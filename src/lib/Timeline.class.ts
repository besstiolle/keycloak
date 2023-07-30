export class Timeline{
    
    private timeline:number[] = []
    private timeline_day:number[] = []
    private timeline_week:number[] = []
    private timeline_month:number[] = []
    private timeline_dayOfWeek:number[] = []

    private minDate:Date
    private maxDate:Date

    //constructor(dateMin:string, dateMax:string){
    constructor(dateMin:Date, dateMax:Date){
        this.minDate = new Date(dateMin)
        this.maxDate = new Date(dateMax)

        this.minDate.setHours(0)
        this.maxDate.setHours(0)

        let min = new Date(dateMin)
        let max = new Date(dateMax)

        min.setHours(0)
        max.setHours(0)

        while(min <= max){
            for(let i=0; i < 8;i++){
                min.setHours(i*3)
                this.timeline.push(min.valueOf())
                this.timeline_day.push(this._getStartOfDay(min))
                this.timeline_week.push(this._getStartOfWeek(min))
                this.timeline_month.push(this._getStartOfMonth(min))
                this.timeline_dayOfWeek.push(min.getDay())
            }

            min.setHours(0)
            min.setDate(min.getDate()+1)
        }
    }

   
    getTimestampByIndex(index:number):number{
        return this.timeline[index]
    }

    getIndexByDate(date:Date):number{
        return this.getIndexByTimestamp(date.valueOf())
    }

    getTimestamps():number[]{  return this.timeline }
    getTimestampsOfDay():number[] { return this.timeline_day}
    getTimestampOfDayByIndex(index:number):number{ return this.timeline_day[index]}
    getTimestampOfWeekByIndex(index:number):number{ return this.timeline_week[index]}
    getTimestampOfMonthByIndex(index:number):number{ return this.timeline_month[index]}
    getDayOfWeekByIndex(index:number):number{ return this.timeline_dayOfWeek[index]}
    
    length():number{
        return this.timeline.length
    }

    getIndexByTimestamp(timestamp:number):number{
        let index = this.timeline.indexOf(timestamp)
        return index
    }

    
    private _getStartOfDay(date:Date):number{
        let tmp = new Date(date)
        tmp.setHours(0)
        return tmp.valueOf()
    }
    
    private _getStartOfMonth(date:Date):number{
        return new Date(date.getFullYear(), date.getMonth(), 1).valueOf()
    }

    private _getStartOfWeek(date:Date):number{
        let now  = new Date(date)
        now.setHours(0)
        now.setDate(now.getDate() - (now.getDay() + 6) % 7)
        return now.valueOf()
    }

}

