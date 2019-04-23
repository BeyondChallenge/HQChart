/*
    封装图形控件
*/

function JSChart(divElement)
{
    this.DivElement=divElement;
    this.DivToolElement=null;           //工具条
    this.JSChartContainer;              //画图控件

    //h5 canvas
    this.CanvasElement=document.createElement("canvas");
    this.CanvasElement.className='jschart-drawing';
    this.CanvasElement.id=Guid();
    this.CanvasElement.setAttribute("tabindex",0);
    if(!divElement.hasChildNodes("canvas")){
        divElement.appendChild(this.CanvasElement);
    }

    //改参数div
    this.ModifyIndexDialog=new ModifyIndexDialog(divElement);
    this.ChangeIndexDialog=new ChangeIndexDialog(divElement);
    this.MinuteDialog=new MinuteDialog(divElement);

    this.OnSize=function()
    {
        //画布大小通过div获取
        var height=parseInt(this.DivElement.style.height.replace("px",""));
        if (this.ToolElement)
        {
            //TODO调整工具条大小
            height-=this.ToolElement.style.height.replace("px","");   //减去工具条的高度
        }

        console.log('window.devicePixelRatio',window.devicePixelRatio);

        this.CanvasElement.height=height;
        this.CanvasElement.width=parseInt(this.DivElement.style.width.replace("px",""));
        this.CanvasElement.style.width=this.CanvasElement.width+'px';
        this.CanvasElement.style.height=this.CanvasElement.height+'px';

        var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
        this.CanvasElement.height*=pixelTatio;
        this.CanvasElement.width*=pixelTatio;

        if (this.JSChartContainer && this.JSChartContainer.Frame)
            this.JSChartContainer.Frame.SetSizeChage(true);

        if (this.JSChartContainer) this.JSChartContainer.Draw();
    }

    //手机屏需要调整 间距
    this.AdjustChartBorder=function(chart)
    {
        var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率

        chart.Frame.ChartBorder.Left*=pixelTatio;
        chart.Frame.ChartBorder.Right*=pixelTatio;
        chart.Frame.ChartBorder.Top*=pixelTatio;
        chart.Frame.ChartBorder.Bottom*=pixelTatio;
    }

    this.AdjustTitleHeight=function(chart)
    {
        var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率

        for(let i in chart.Frame.SubFrame)
        {
            chart.Frame.SubFrame[i].Frame.ChartBorder.TitleHeight*=pixelTatio;
        }

        chart.ChartCorssCursor.TextHeight*=pixelTatio;  //十字光标文本信息高度
    }

    //历史K线图
    this.CreateKLineChartContainer=function(option)
    {
        var chart=null;
        if (option.Type==="历史K线图横屏") chart=new KLineChartHScreenContainer(this.CanvasElement);
        else chart=new KLineChartContainer(this.CanvasElement);

        //创建改参数div
        chart.ModifyIndexDialog=this.ModifyIndexDialog;
        chart.ChangeIndexDialog=this.ChangeIndexDialog;
        chart.MinuteDialog=this.MinuteDialog;
        
        //右键菜单
        if (option.IsShowRightMenu==true) chart.RightMenu=new KLineRightMenu(this.DivElement);
        if (option.ScriptError) chart.ScriptErrorCallback=option.ScriptError;
        chart.SelectRectRightMenu=new KLineSelectRightMenu(this.DivElement);

        if (option.KLine)   //k线图的属性设置
        {
            if (option.KLine.DragMode>=0) chart.DragMode=option.KLine.DragMode;
            if (option.KLine.Right>=0) chart.Right=option.KLine.Right;
            if (option.KLine.Period>=0) chart.Period=option.KLine.Period;
            if (option.KLine.MaxReqeustDataCount>0) chart.MaxReqeustDataCount=option.KLine.MaxReqeustDataCount;
            if (option.KLine.Info && option.KLine.Info.length>0) chart.SetKLineInfo(option.KLine.Info,false);
            if (option.KLine.IndexTreeApiUrl) chart.ChangeIndexDialog.IndexTreeApiUrl=option.KLine.IndexTreeApiUrl;
            if (option.KLine.KLineDoubleClick==false) chart.MinuteDialog=this.MinuteDialog=null;
            if (option.KLine.IndexTreeApiUrl!=null) chart.ChangeIndexDialog.IndexTreeApiUrl=option.KLine.IndexTreeApiUrl;
            if (option.KLine.PageSize>0)  chart.PageSize=option.KLine.PageSize;
            if (option.KLine.IsShowTooltip==false) chart.IsShowTooltip=false;
            if (option.KLine.MaxRequestMinuteDayCount>0) chart.MaxRequestMinuteDayCount=option.KLine.MaxRequestMinuteDayCount;
            if (option.KLine.DrawType) chart.KLineDrawType=option.KLine.DrawType;
        }

        if (!option.Windows || option.Windows.length<=0) return null;

        //创建子窗口
        chart.Create(option.Windows.length);

        if (option.Border)
        {
            if (!isNaN(option.Border.Left)) chart.Frame.ChartBorder.Left=option.Border.Left;
            if (!isNaN(option.Border.Right)) chart.Frame.ChartBorder.Right=option.Border.Right;
            if (!isNaN(option.Border.Top)) chart.Frame.ChartBorder.Top=option.Border.Top;
            if (!isNaN(option.Border.Bottom)) chart.Frame.ChartBorder.Bottom=option.Border.Bottom;
        }

        this.AdjustChartBorder(chart);

        if (option.IsShowCorssCursorInfo==false)    //取消显示十字光标刻度信息
        {
            chart.ChartCorssCursor.IsShowText=option.IsShowCorssCursorInfo;
        }

        if (option.Frame)
        {
            for(var i in option.Frame)
            {
                var item=option.Frame[i];
                if (!chart.Frame.SubFrame[i]) continue;
                if (item.SplitCount) chart.Frame.SubFrame[i].Frame.YSplitOperator.SplitCount=item.SplitCount;
                if (item.StringFormat) chart.Frame.SubFrame[i].Frame.YSplitOperator.StringFormat=item.StringFormat;
                if (!isNaN(item.Height)) chart.Frame.SubFrame[i].Height = item.Height;
                if (item.IsShowLeftText==false) chart.Frame.SubFrame[i].Frame.YSplitOperator.IsShowLeftText=item.IsShowLeftText;            //显示左边刻度
                if (item.IsShowRightText==false) chart.Frame.SubFrame[i].Frame.YSplitOperator.IsShowRightText=item.IsShowRightText;         //显示右边刻度 
            }
        }

        if (option.KLine) 
        {
            if (option.KLine.ShowKLine == false) chart.ChartPaint[0].IsShow = false;
        }

        if(option.KLineTitle)
        {
            if(option.KLineTitle.IsShowName==false) chart.TitlePaint[0].IsShowName=false;
            if(option.KLineTitle.IsShowSettingInfo==false) chart.TitlePaint[0].IsShowSettingInfo=false;
            if(option.KLineTitle.IsShow == false) chart.TitlePaint[0].IsShow = false;
        }

        //叠加股票
        if (option.Overlay && option.Overlay.length)
        {
            chart.OverlayChartPaint[0].Symbol= option.Overlay[0].Symbol;
        }

        if (option.ExtendChart)
        {
            for(var i in option.ExtendChart)
            {
                var item=option.ExtendChart[i];
                chart.CreateExtendChart(item.Name, item);
            }
        }

        //创建子窗口的指标
        let scriptData = new JSIndexScript();

        if (option.ColorIndex)    //五彩K线
        {
            var item=option.ColorIndex;
            let indexInfo=scriptData.Get(item.Index);
            if (indexInfo)
            {
                indexInfo.ID=item.Index;
                chart.ColorIndex=new ScriptIndex(indexInfo.Name, indexInfo.Script, indexInfo.Args,indexInfo);    //脚本执行
            }
        }

        if (option.TradeIndex)  //交易指标
        {
            var item=option.TradeIndex;
            let indexInfo=scriptData.Get(item.Index);
            if (indexInfo)
            {
                indexInfo.ID=item.Index;
                chart.TradeIndex=new ScriptIndex(indexInfo.Name, indexInfo.Script, indexInfo.Args,indexInfo);    //脚本执行
            }
        }

        for(var i in option.Windows)
        {
            var item=option.Windows[i];
            if (item.Script)
            {
                chart.WindowIndex[i]=new ScriptIndex(item.Name,item.Script,item.Args,item);    //脚本执行
            }
            else if (item.JsonData)
            {
                chart.WindowIndex[i]=new JsonDataIndex(item.Name,item.Script,item.Args,item);    //脚本执行
            }
            else
            {
                let indexItem=JSIndexMap.Get(item.Index);
                if (indexItem)
                {
                    chart.WindowIndex[i]=indexItem.Create();
                    chart.CreateWindowIndex(i);
                }
                else
                {
                    let indexInfo = scriptData.Get(item.Index);
                    if (!indexInfo) continue;

                    if (item.Lock) indexInfo.Lock=item.Lock;
                    indexInfo.ID=item.Index;
                    chart.WindowIndex[i] = new ScriptIndex(indexInfo.Name, indexInfo.Script, indexInfo.Args,indexInfo);    //脚本执行
                }

            }

            if (item.Modify!=null) chart.Frame.SubFrame[i].Frame.ModifyIndex=item.Modify;
            if (item.Change!=null) chart.Frame.SubFrame[i].Frame.ChangeIndex=item.Change;
            if (item.Close!=null) chart.Frame.SubFrame[i].Frame.CloseIndex=item.Close;

            if (!isNaN(item.TitleHeight)) chart.Frame.SubFrame[i].Frame.ChartBorder.TitleHeight=item.TitleHeight;
        }
        this.AdjustTitleHeight(chart);

        return chart;
    }

    //自定义指数历史K线图
    this.CreateCustomKLineChartContainer=function(option)
    {
        var chart=new CustomKLineChartContainer(this.CanvasElement);

        //创建改参数div
        chart.ModifyIndexDialog=this.ModifyIndexDialog;
        chart.ChangeIndexDialog=this.ChangeIndexDialog;
        chart.MinuteDialog=this.MinuteDialog;
        
        //右键菜单
        if (option.IsShowRightMenu==true) chart.RightMenu=new KLineRightMenu(this.DivElement);

        if (option.KLine)   //k线图的属性设置
        {
            if (option.KLine.DragMode>=0) chart.DragMode=option.KLine.DragMode;
            if (option.KLine.Right>=0) chart.Right=option.KLine.Right;
            if (option.KLine.Period>=0) chart.Period=option.KLine.Period;
            if (option.KLine.MaxReqeustDataCount>0) chart.MaxReqeustDataCount=option.KLine.MaxReqeustDataCount;
            if (option.KLine.Info && option.KLine.Info.length>0) chart.SetKLineInfo(option.KLine.Info,false);
            if (option.KLine.IndexTreeApiUrl) chart.ChangeIndexDialog.IndexTreeApiUrl=option.KLine.IndexTreeApiUrl;
            if (option.KLine.KLineDoubleClick==false) chart.MinuteDialog=this.MinuteDialog=null;
            if (option.KLine.IndexTreeApiUrl!=null) chart.ChangeIndexDialog.IndexTreeApiUrl=option.KLine.IndexTreeApiUrl;
            if (option.KLine.PageSize>0)  chart.PageSize=option.KLine.PageSize;
            if (option.KLine.IsShowTooltip==false) chart.IsShowTooltip=false;
        }

        if (option.CustomStock) chart.CustomStock=option.CustomStock;
        if (option.QueryDate) chart.QueryDate=option.QueryDate;

        if (!option.Windows || option.Windows.length<=0) return null;

        //创建子窗口
        chart.Create(option.Windows.length);

        if (option.Border)
        {
            if (!isNaN(option.Border.Left)) chart.Frame.ChartBorder.Left=option.Border.Left;
            if (!isNaN(option.Border.Right)) chart.Frame.ChartBorder.Right=option.Border.Right;
            if (!isNaN(option.Border.Top)) chart.Frame.ChartBorder.Top=option.Border.Top;
        }

        if (option.IsShowCorssCursorInfo==false)    //取消显示十字光标刻度信息
        {
            chart.ChartCorssCursor.IsShowText=option.IsShowCorssCursorInfo;
        }

        if (option.Frame)
        {
            for(var i in option.Frame)
            {
                var item=option.Frame[i];
                if (item.SplitCount) chart.Frame.SubFrame[i].Frame.YSplitOperator.SplitCount=item.SplitCount;
                if (item.StringFormat) chart.Frame.SubFrame[i].Frame.YSplitOperator.StringFormat=item.StringFormat;
            }
        }

        if(option.KLineTitle)
        {
            if(option.KLineTitle.IsShowName==false) chart.TitlePaint[0].IsShowName=false;
            if(option.KLineTitle.IsShowSettingInfo==false) chart.TitlePaint[0].IsShowSettingInfo=false;
        }

        //创建子窗口的指标
        let scriptData = new JSIndexScript();
        for(var i in option.Windows)
        {
            var item=option.Windows[i];
            if (item.Script)
            {
                chart.WindowIndex[i]=new ScriptIndex(item.Name,item.Script,item.Args,item);    //脚本执行
            }
            else
            {
                let indexItem=JSIndexMap.Get(item.Index);
                if (indexItem)
                {
                    chart.WindowIndex[i]=indexItem.Create();
                    chart.CreateWindowIndex(i);
                }
                else
                {
                    let indexInfo = scriptData.Get(item.Index);
                    if (!indexInfo) continue;

                    if (item.Lock) indexInfo.Lock=item.Lock;
                    chart.WindowIndex[i] = new ScriptIndex(indexInfo.Name, indexInfo.Script, indexInfo.Args,indexInfo);    //脚本执行
                }
            }
           
            if (item.Modify!=null)
                chart.Frame.SubFrame[i].Frame.ModifyIndex=item.Modify;
            if (item.Change!=null)
                chart.Frame.SubFrame[i].Frame.ChangeIndex=item.Change;

            if (!isNaN(item.TitleHeight)) chart.Frame.SubFrame[i].Frame.ChartBorder.TitleHeight=item.TitleHeight;
        }

        return chart;
    }

    //分钟走势图
    this.CreateMinuteChartContainer=function(option)
    {
        var chart=null;
        if (option.Type==="分钟走势图横屏") chart=new MinuteChartHScreenContainer(this.CanvasElement);
        else chart=new MinuteChartContainer(this.CanvasElement);

        var windowsCount=2;
        if (option.Windows && option.Windows.length>0) windowsCount+=option.Windows.length; //指标窗口从第3个窗口开始

        chart.Create(windowsCount);                            //创建子窗口

        if (option.IsShowCorssCursorInfo==false)    //取消显示十字光标刻度信息
        {
            chart.ChartCorssCursor.IsShowText=option.IsShowCorssCursorInfo;
        }

        if (option.IsShowRightMenu==true) chart.RightMenu=new MinuteRightMenu(this.DivElement);

        if (option.DayCount>1) chart.DayCount=option.DayCount;

        if (option.Border)
        {
            if (!isNaN(option.Border.Left)) chart.Frame.ChartBorder.Left=option.Border.Left;
            if (!isNaN(option.Border.Right)) chart.Frame.ChartBorder.Right=option.Border.Right;
            if (!isNaN(option.Border.Top)) chart.Frame.ChartBorder.Top=option.Border.Top;
            if (!isNaN(option.Border.Bottom)) chart.Frame.ChartBorder.Bottom=option.Border.Bottom;
        }
        this.AdjustChartBorder(chart);

        if (option.Frame)
        {
            for(var i in option.Frame)
            {
                var item=option.Frame[i];
                if (!chart.Frame.SubFrame[i]) continue;
                if (item.SplitCount) chart.Frame.SubFrame[i].Frame.YSplitOperator.SplitCount=item.SplitCount;
                if (item.StringFormat) chart.Frame.SubFrame[i].Frame.YSplitOperator.StringFormat=item.StringFormat;
            }
        }

        //叠加股票
        if (option.Overlay && option.Overlay.length)
        {
            chart.OverlayChartPaint[0].Symbol= option.Overlay[0].Symbol;
        }

        if (option.MinuteLine)
        {
            if (option.MinuteLine.IsDrawAreaPrice==false) chart.ChartPaint[0].IsDrawArea=false;
        }

        //分钟数据指标从第3个指标窗口设置
        let scriptData = new JSIndexScript();
        for(var i in option.Windows)
        {
            var item=option.Windows[i];
            if (item.Script)
            {
                chart.WindowIndex[2+parseInt(i)]=new ScriptIndex(item.Name,item.Script,item.Args);    //脚本执行
            }
            else
            {
                var indexItem=JSIndexMap.Get(item.Index);
                if (indexItem)
                {
                    chart.WindowIndex[2+parseInt(i)]=indexItem.Create();       //创建子窗口的指标
                    chart.CreateWindowIndex(2+parseInt(i));
                }
                else
                {
                    let indexInfo = scriptData.Get(item.Index);
                    if (!indexInfo) continue;
                    indexInfo.ID=item.Index;
                    chart.WindowIndex[2+parseInt(i)] = new ScriptIndex(indexInfo.Name, indexInfo.Script, indexInfo.Args,indexInfo);    //脚本执行
                }
            }

            if (!isNaN(item.TitleHeight)) chart.Frame.SubFrame[2+parseInt(i)].Frame.ChartBorder.TitleHeight=item.TitleHeight;
        }
        this.AdjustTitleHeight(chart);

        return chart;
    }

    //历史分钟走势图
    this.CreateHistoryMinuteChartContainer=function(option)
    {
        var chart=new HistoryMinuteChartContainer(this.CanvasElement);

        var windowsCount=2;
        if (option.Windows && option.Windows.length>0) windowsCount+=option.Windows.length; //指标窗口从第3个窗口开始

        chart.Create(windowsCount);                            //创建子窗口

        if (option.IsShowCorssCursorInfo==false)    //取消显示十字光标刻度信息
        {
            chart.ChartCorssCursor.IsShowText=option.IsShowCorssCursorInfo;
        }

        if (option.Border)
        {
            if (!isNaN(option.Border.Left)) chart.Frame.ChartBorder.Left=option.Border.Left;
            if (!isNaN(option.Border.Right)) chart.Frame.ChartBorder.Right=option.Border.Right;
            if (!isNaN(option.Border.Top)) chart.Frame.ChartBorder.Top=option.Border.Top;
            if (!isNaN(option.Border.Bottom)) chart.Frame.ChartBorder.Bottom=option.Border.Bottom;
        }

        let scriptData = new JSIndexScript();
        for(var i in option.Windows)
        {
            var item=option.Windows[i];
            if (item.Script)
            {
                chart.WindowIndex[2+parseInt(i)]=new ScriptIndex(item.Name,item.Script,item.Args);    //脚本执行
            }
            else
            {
                var indexItem=JSIndexMap.Get(item.Index);
                if (indexItem)
                {
                    chart.WindowIndex[2+parseInt(i)]=indexItem.Create();       //创建子窗口的指标
                    chart.CreateWindowIndex(2+parseInt(i));
                }
                else
                {
                    let indexInfo = scriptData.Get(item.Index);
                    if (!indexInfo) continue;

                    chart.WindowIndex[2+parseInt(i)] = new ScriptIndex(indexInfo.Name, indexInfo.Script, indexInfo.Args);    //脚本执行
                }
            }

            if (!isNaN(item.TitleHeight)) chart.Frame.SubFrame[2+parseInt(i)].Frame.ChartBorder.TitleHeight=item.TitleHeight;
        }

        chart.TradeDate=20181009;
        if (option.HistoryMinute.TradeDate) chart.TradeDate=option.HistoryMinute.TradeDate;
        if (option.HistoryMinute.IsShowName!=null) chart.TitlePaint[0].IsShowName=option.HistoryMinute.IsShowName;  //动态标题是否显示股票名称
        if (option.HistoryMinute.IsShowDate!=null) chart.TitlePaint[0].IsShowDate=option.HistoryMinute.IsShowDate;  //动态标题是否显示日期

        return chart;
    }

    this.CreateKLineTrainChartContainer=function(option)
    {
        var bHScreen=(option.Type=='K线训练横屏'? true:false);
        var chart=new KLineTrainChartContainer(this.CanvasElement,bHScreen);

        if (option.ScriptError) chart.ScriptErrorCallback=option.ScriptError;

        if (option.KLine)   //k线图的属性设置
        {
            if (option.KLine.Right>=0) chart.Right=option.KLine.Right;
            if (option.KLine.Period>=0) chart.Period=option.KLine.Period;
            if (option.KLine.MaxReqeustDataCount>0) chart.MaxReqeustDataCount=option.KLine.MaxReqeustDataCount;
            if (option.KLine.Info && option.KLine.Info.length>0) chart.SetKLineInfo(option.KLine.Info,false);
            if (option.KLine.PageSize>0)  chart.PageSize=option.KLine.PageSize;
            if (option.KLine.IsShowTooltip==false) chart.IsShowTooltip=false;
            if (option.KLine.MaxRequestMinuteDayCount>0) chart.MaxRequestMinuteDayCount=option.KLine.MaxRequestMinuteDayCount;
            if (option.KLine.DrawType) chart.KLineDrawType=option.KLine.DrawType;
            
        }

        if (option.Train)
        {
            if (option.Train.DataCount) chart.TrainDataCount=option.Train.DataCount;
            if (option.Train.Callback) chart.TrainCallback=option.Train.Callback;
        }

        if (!option.Windows || option.Windows.length<=0) return null;

        //创建子窗口
        chart.Create(option.Windows.length);

        if (option.Border)
        {
            if (!isNaN(option.Border.Left)) chart.Frame.ChartBorder.Left=option.Border.Left;
            if (!isNaN(option.Border.Right)) chart.Frame.ChartBorder.Right=option.Border.Right;
            if (!isNaN(option.Border.Top)) chart.Frame.ChartBorder.Top=option.Border.Top;
            if (!isNaN(option.Border.Bottom)) chart.Frame.ChartBorder.Bottom=option.Border.Bottom;
        }

        this.AdjustChartBorder(chart);

        if (option.IsShowCorssCursorInfo==false)    //取消显示十字光标刻度信息
        {
            chart.ChartCorssCursor.IsShowText=option.IsShowCorssCursorInfo;
        }

        if (option.Frame)
        {
            for(var i in option.Frame)
            {
                var item=option.Frame[i];
                if (item.SplitCount) chart.Frame.SubFrame[i].Frame.YSplitOperator.SplitCount=item.SplitCount;
                if (item.StringFormat) chart.Frame.SubFrame[i].Frame.YSplitOperator.StringFormat=item.StringFormat;
            }
        }

        //股票名称 日期 周期都不显示
        chart.TitlePaint[0].IsShowName=false;
        chart.TitlePaint[0].IsShowSettingInfo=false;
        chart.TitlePaint[0].IsShowDateTime=false;

        //创建子窗口的指标
        let scriptData = new JSIndexScript();
        for(var i in option.Windows)
        {
            var item=option.Windows[i];
            if (item.Script)
            {
                chart.WindowIndex[i]=new ScriptIndex(item.Name,item.Script,item.Args,item);    //脚本执行
            }
            else
            {
                let indexItem=JSIndexMap.Get(item.Index);
                if (indexItem)
                {
                    chart.WindowIndex[i]=indexItem.Create();
                    chart.CreateWindowIndex(i);
                }
                else
                {
                    let indexInfo = scriptData.Get(item.Index);
                    if (!indexInfo) continue;

                    if (item.Lock) indexInfo.Lock=item.Lock;
                    chart.WindowIndex[i] = new ScriptIndex(indexInfo.Name, indexInfo.Script, indexInfo.Args,indexInfo);    //脚本执行
                }

            }

            if (item.Modify!=null) chart.Frame.SubFrame[i].Frame.ModifyIndex=item.Modify;
            if (item.Change!=null) chart.Frame.SubFrame[i].Frame.ChangeIndex=item.Change;
            if (item.Close!=null) chart.Frame.SubFrame[i].Frame.CloseIndex=item.Close;

            if (!isNaN(item.TitleHeight)) chart.Frame.SubFrame[i].Frame.ChartBorder.TitleHeight=item.TitleHeight;
        }

        this.AdjustTitleHeight(chart);
        
        return chart;
    }

    //根据option内容绘制图形
    this.SetOption=function(option)
    {
        var chart=null;
        switch(option.Type)
        {
            case "历史K线图":
            case '历史K线图横屏':
                chart=this.CreateKLineChartContainer(option);
                break;
            case "自定义指数历史K线图":
                chart=this.CreateCustomKLineChartContainer(option);
                break;
            case "分钟走势图":
            case "分钟走势图横屏":
                chart=this.CreateMinuteChartContainer(option);
                break;
            case "历史分钟走势图":
                chart=this.CreateHistoryMinuteChartContainer(option);
                break;
            case 'K线训练':
            case 'K线训练横屏':
                chart=this.CreateKLineTrainChartContainer(option);
                break;
            case "简单图形":
                return this.CreateSimpleChart(option);
            case "饼图":
            case '雷达图':
                return this.CreatePieChart(option);
            case '地图':
                return this.CreateMapChart(option);
            default:
                return false;
        }

        if (!chart) return false;

        //是否自动更新
        if(option.IsAutoUpdate!=null) chart.IsAutoUpdate=option.IsAutoUpdate;

        //设置股票代码
        if (!option.Symbol) return false;
        chart.Draw();
        chart.ChangeSymbol(option.Symbol);

        this.JSChartContainer=chart;
        this.DivElement.JSChart=this;   //div中保存一份
        this.JSChartContainer.Draw();
    }

    this.CreateSimpleChart=function(option)
    {
        var chart=new SimlpleChartContainer(this.CanvasElement);
        if (option.MainDataControl) chart.MainDataControl=option.MainDataControl;

        chart.Create();

        if (option.Border)  //边框设置
        {
            if (!isNaN(option.Border.Left)) chart.Frame.ChartBorder.Left=option.Border.Left;
            if (!isNaN(option.Border.Right)) chart.Frame.ChartBorder.Right=option.Border.Right;
            if (!isNaN(option.Border.Top)) chart.Frame.ChartBorder.Top=option.Border.Top;
        }

        
        chart.Draw();
        chart.RequestData();

        this.JSChartContainer=chart;
        this.DivElement.JSChart=this;   //div中保存一份
        this.JSChartContainer.Draw();
    }

    //创建饼图
    this.CreatePieChart=function(option)
    {
        var chart=new PieChartContainer(this.CanvasElement);
        if (option.MainDataControl) chart.MainDataControl=option.MainDataControl;

        if(option.Radius) chart.Radius = option.Radius;
        
        chart.Create();

        if (option.Border)  //边框设置
        {
            if (!isNaN(option.Border.Left)) chart.Frame.ChartBorder.Left=option.Border.Left;
            if (!isNaN(option.Border.Right)) chart.Frame.ChartBorder.Right=option.Border.Right;
            if (!isNaN(option.Border.Top)) chart.Frame.ChartBorder.Top=option.Border.Top;
        }

        this.AdjustChartBorder(chart);

        if (option.Frame) 
        {
            if (option.Frame[0].IsShowBorder == false) chart.Frame.IsShowBorder = option.Frame[0].IsShowBorder;
        }
        
        chart.Draw();
        chart.RequestData();

        this.JSChartContainer=chart;
        this.DivElement.JSChart=this;   //div中保存一份
        this.JSChartContainer.Draw();
        
    }

    this.CreateMapChart=function(option)
    {
        var chart=new MapChartContainer(this.CanvasElement);
        if (option.MainDataControl) chart.MainDataControl=option.MainDataControl;

        chart.Create();

        if (option.Border)  //边框设置
        {
            if (!isNaN(option.Border.Left)) chart.Frame.ChartBorder.Left=option.Border.Left;
            if (!isNaN(option.Border.Right)) chart.Frame.ChartBorder.Right=option.Border.Right;
            if (!isNaN(option.Border.Top)) chart.Frame.ChartBorder.Top=option.Border.Top;
        }
        
        chart.Draw();
        chart.RequestData();

        this.JSChartContainer=chart;
        this.DivElement.JSChart=this;   //div中保存一份
        this.JSChartContainer.Draw();
    }

    //创建工具条
    this.CreateToolbar=function(option)
    {

    }

    //创建设置div窗口
    this.CreateSettingDiv=function(option)
    {

    }

    this.Focus=function()
    {
        if (this.CanvasElement) this.CanvasElement.focus();
    }

    //切换股票代码接口
    this.ChangeSymbol=function(symbol)
    {
        if (this.JSChartContainer) this.JSChartContainer.ChangeSymbol(symbol);
    }

    //K线切换指标
    this.ChangeIndex=function(windowIndex,indexName)
    {
        if (this.JSChartContainer && typeof(this.JSChartContainer.ChangeIndex)=='function')
            this.JSChartContainer.ChangeIndex(windowIndex,indexName);
    }

    this.ChangeScriptIndex=function(windowIndex,indexData)
    {
        if (this.JSChartContainer && typeof(this.JSChartContainer.ChangeScriptIndex)=='function')
            this.JSChartContainer.ChangeScriptIndex(windowIndex,indexData);
    }

    this.ChangePyScriptIndex=function(windowIndex, indexData)   //切换py指标
    {
        if (this.JSChartContainer && typeof(this.JSChartContainer.ChangePyScriptIndex)=='function')
            this.JSChartContainer.ChangePyScriptIndex(windowIndex,indexData);
    }

    this.GetIndexInfo=function()
    {
        if (this.JSChartContainer && typeof(this.JSChartContainer.GetIndexInfo)=='function')
            return this.JSChartContainer.GetIndexInfo();
        else 
            return [];
    }

    this.ChangeInstructionIndex=function(indexName) 
    {
        if (this.JSChartContainer && typeof(this.JSChartContainer.ChangeInstructionIndex)=='function')
            this.JSChartContainer.ChangeInstructionIndex(indexName);
    }

    this.ChangeInstructionScriptIndex=function(indexData)
    {
        if (this.JSChartContainer && typeof(this.JSChartContainer.ChangeInstructionIndex)=='function')
            this.JSChartContainer.ChangeInstructionScriptIndex(indexData);
    }

    this.CancelInstructionIndex=function()
    {
        if (this.JSChartContainer && typeof(this.JSChartContainer.CancelInstructionIndex)=='function')
            this.JSChartContainer.CancelInstructionIndex();
    }

    //K线周期切换
    this.ChangePeriod=function(period)
    {
        if (this.JSChartContainer && typeof(this.JSChartContainer.ChangePeriod)=='function')
            this.JSChartContainer.ChangePeriod(period);
    }

    //K线复权切换
    this.ChangeRight=function(right)
    {
        if (this.JSChartContainer && typeof(this.JSChartContainer.ChangeRight)=='function')
            this.JSChartContainer.ChangeRight(right);
    }

    //叠加股票
    this.OverlaySymbol=function(symbol)
    {
        if (this.JSChartContainer && typeof(this.JSChartContainer.OverlaySymbol)=='function')
            this.JSChartContainer.OverlaySymbol(symbol);
    }

    //K线切换类型 0=实心K线 1=收盘价线 2=美国线 3=空心K线
    this.ChangeKLineDrawType=function(drawType)
    {
        if (this.JSChartContainer && typeof(this.JSChartContainer.ChangeKLineDrawType)=='function')
            this.JSChartContainer.ChangeKLineDrawType(drawType);
    }
	
	//指标窗口个数
    this.ChangeIndexWindowCount = function(count){
        if(this.JSChartContainer && typeof(this.JSChartContainer.ChangeIndexWindowCount) == 'function'){
            this.JSChartContainer.ChangeIndexWindowCount(count);
        }
    }
	
	//取消叠加
    this.ClearOverlaySymbol = function(){
        if(this.JSChartContainer && typeof(this.JSChartContainer.ClearOverlaySymbol) == 'function'){
            this.JSChartContainer.ClearOverlaySymbol();
        } 
    }

    this.DeleteKLineInfo=function(infoName)
    {
        if(this.JSChartContainer && typeof(this.JSChartContainer.DeleteKLineInfo) == 'function')
        {
            this.JSChartContainer.DeleteKLineInfo(infoName);
        } 
    }
    
    this.ClearKLineInfo=function()
    {
        if(this.JSChartContainer && typeof(this.JSChartContainer.ClearKLineInfo) == 'function')
        {
            this.JSChartContainer.ClearKLineInfo();
        } 
    }

    this.AddKLineInfo=function(infoName, bUpdate)
    {
        if(this.JSChartContainer && typeof(this.JSChartContainer.AddKLineInfo) == 'function')
        {
            this.JSChartContainer.AddKLineInfo(infoName,bUpdate);
        } 
    }

    this.ChangMainDataControl=function(dataControl)
    {
        if (this.JSChartContainer && typeof(this.JSChartContainer.SetMainDataConotrl)=='function') 
            this.JSChartContainer.SetMainDataConotrl(dataControl);
    }

    //设置强制横屏
    this.ForceLandscape=function(bForceLandscape)
    {
        if (this.JSChartContainer) 
        {
            console.log("[JSChart::ForceLandscape] bForceLandscape="+bForceLandscape);
            this.JSChartContainer.IsForceLandscape=bForceLandscape;
        }
    }

    //锁指标
    this.LockIndex=function(lockData)
    {
        if(this.JSChartContainer && typeof(this.JSChartContainer.LockIndex)=='function')
        {
            console.log('[JSChart:LockIndex] lockData', lockData);
            this.JSChartContainer.LockIndex(lockData);
        }
    }

    //历史分钟数据 更改日期
    this.ChangeTradeDate=function(tradeDate)
    {
        if(this.JSChartContainer && typeof(this.JSChartContainer.ChangeTradeDate)=='function')
        {
            console.log('[JSChart:ChangeTradeDate] date', tradeDate);
            this.JSChartContainer.ChangeTradeDate(tradeDate);
        }
    }

    //多日走势图
    this.ChangeDayCount=function(count)
    {
        if(this.JSChartContainer && typeof(this.JSChartContainer.ChangeDayCount)=='function')
        {
            console.log('[JSChart:ChangeDayCount] count', count);
            this.JSChartContainer.ChangeDayCount(count);
        }
    }

    //事件回调
    this.AddEventCallback=function(obj)
    {
        if(this.JSChartContainer && typeof(this.JSChartContainer.AddEventCallback)=='function')
        {
            console.log('[JSChart:AddEventCallback] ', obj);
            this.JSChartContainer.AddEventCallback(obj);
        }
    }
}

//初始化
JSChart.Init=function(divElement)
{
    var jsChartControl=new JSChart(divElement);
    jsChartControl.OnSize();

    return jsChartControl;
}

JSChart.SetDomain=function(domain,cacheDomain)
{
    if (domain) g_JSChartResource.Domain=domain;
    if (cacheDomain) g_JSChartResource.CacheDomain=cacheDomain;
}

JSChart.SetPyIndexDomain=function(domain)   //设置py指标计算api域名
{
    if  (domain) g_JSChartResource.PyIndexDomain=domain;
}

//自定义风格
JSChart.SetStyle=function(option)
{
    if (option) g_JSChartResource.SetStyle(option);
}

//获取设备分辨率比
JSChart.GetDevicePixelRatio=function()
{
    return GetDevicePixelRatio();
}

JSChart.CreateGuid=function()
{
    return Guid();
}

var JSCHART_EVENT_ID=
{
    RECV_KLINE_MATCH:1, //接收到形态匹配
}

/*
    图形控件
*/
function JSChartContainer(uielement)
{
    this.ClassName='JSChartContainer';
    var _self = this;
    this.Frame;                                     //框架画法
    this.ChartPaint=new Array();                    //图形画法
    this.ChartPaintEx=[];                           //图形扩展画法
    this.ChartInfo=new Array();                     //K线上信息地雷
    this.ExtendChartPaint=new Array();              //扩展画法
    this.TitlePaint=new Array();                    //标题画法
    this.OverlayChartPaint=new Array();             //叠加信息画法
    this.ChartDrawPicture=new Array();              //画图工具
    this.CurrentChartDrawPicture=null;              //当前的画图工具
    this.SelectChartDrawPicture=null;               //当前选中的画图
    this.ChartCorssCursor;                          //十字光标
    this.ChartSplashPaint=null;                     //等待提示
    this.Canvas=uielement.getContext("2d");         //画布
    this.UIElement=uielement;
    this.MouseDrag;
    this.DragMode=1;                                //拖拽模式 0 禁止拖拽 1 数据拖拽 2 区间选择

    this.CursorIndex=0;             //十字光标X轴索引
    this.LastPoint=new Point();     //鼠标位置
    this.IsForceLandscape=false;    //是否强制横屏

    //tooltip提示信息
    this.Tooltip=document.createElement("div");
    this.Tooltip.className='jschart-tooltip';
    this.Tooltip.style.background=g_JSChartResource.TooltipBGColor;
    this.Tooltip.style.opacity=g_JSChartResource.TooltipAlpha;
    this.Tooltip.id=Guid();
    uielement.parentNode.appendChild(this.Tooltip);
    this.IsShowTooltip=true;    //是否显示K线tooltip

    //区间选择
    this.SelectRect=document.createElement("div");
    this.SelectRect.className="jschart-selectrect";
    this.SelectRect.style.background=g_JSChartResource.SelectRectBGColor;
    //this.SelectRect.style.opacity=g_JSChartResource.SelectRectAlpha;
    this.SelectRect.id=Guid();
    uielement.parentNode.appendChild(this.SelectRect);
    //区间选择右键菜单
    this.SelectRectRightMenu;   

    //坐标轴风格方法 double-更加数值型分割  price-更加股票价格分割
    this.FrameSplitData=new Map();
    this.FrameSplitData.set("double",new SplitData());
    this.FrameSplitData.set("price",new PriceSplitData());

    //事件回调
    this.mapEvent=new Map();   //通知外部调用 key:JSCHART_EVENT_ID value:{Callback:回调,}

    //设置事件回调
    //{event:事件id, callback:回调函数}
    this.AddEventCallback=function(object)
    {
        if (!object || !object.event || !object.callback) return;

        var data={Callback:object.callback, Source:object};
        this.mapEvent.set(object.event,data);
    }

    this.RemoveEventCallback=function(eventid)
    {
        if (!this.mapEvent.has(eventid)) return;

        this.mapEvent.delete(eventid);
    }

    uielement.onmousemove=function(e)
    {
        var x = e.clientX-this.getBoundingClientRect().left;
        var y = e.clientY-this.getBoundingClientRect().top;

        //加载数据中,禁用鼠标事件
        if (this.JSChartContainer.ChartSplashPaint && this.JSChartContainer.ChartSplashPaint.IsEnableSplash == true) return;

        if(this.JSChartContainer)
            this.JSChartContainer.OnMouseMove(x,y,e);
    }

    uielement.oncontextmenu=function(e)
    {
        var x = e.clientX-this.getBoundingClientRect().left;
        var y = e.clientY-this.getBoundingClientRect().top;

        if(this.JSChartContainer && typeof(this.JSChartContainer.OnRightMenu)=='function')
            this.JSChartContainer.OnRightMenu(x,y,e);   //右键菜单事件

        return false;
    }

    uielement.onmousedown=function(e)
    {
        if(!this.JSChartContainer) return;
        if(this.JSChartContainer.DragMode==0) return;

        if (this.JSChartContainer.TryClickLock)
        {
            var x = e.clientX-this.getBoundingClientRect().left;
            var y = e.clientY-this.getBoundingClientRect().top;
            if (this.JSChartContainer.TryClickLock(x,y)) return;
        }

        this.JSChartContainer.HideSelectRect();
        if (this.JSChartContainer.SelectRectRightMenu) this.JSChartContainer.SelectRectRightMenu.Hide();
        if (this.JSChartContainer.ChartPictureMenu) this.JSChartContainer.ChartPictureMenu.Hide();

        var drag=
        {
            "Click":{},
            "LastMove":{}  //最后移动的位置
        };

        drag.Click.X=e.clientX;
        drag.Click.Y=e.clientY;
        drag.LastMove.X=e.clientX;
        drag.LastMove.Y=e.clientY;

        this.JSChartContainer.MouseDrag=drag;
        document.JSChartContainer=this.JSChartContainer;
        this.JSChartContainer.SelectChartDrawPicture=null;
        if (this.JSChartContainer.CurrentChartDrawPicture)  //画图工具模式
        {
            var drawPicture=this.JSChartContainer.CurrentChartDrawPicture;
            if (drawPicture.Status==2)
                this.JSChartContainer.SetChartDrawPictureThirdPoint(drag.Click.X,drag.Click.Y);
            else
            {
                this.JSChartContainer.SetChartDrawPictureFirstPoint(drag.Click.X,drag.Click.Y);
                //只有1个点 直接完成
                if (this.JSChartContainer.FinishChartDrawPicturePoint()) this.JSChartContainer.DrawDynamicInfo();
            }
        }
        else    //是否在画图工具上
        {
            var drawPictrueData={};
            drawPictrueData.X=e.clientX-this.getBoundingClientRect().left;
            drawPictrueData.Y=e.clientY-this.getBoundingClientRect().top;
            if (this.JSChartContainer.GetChartDrawPictureByPoint(drawPictrueData))
            {
                drawPictrueData.ChartDrawPicture.Status=20;
                drawPictrueData.ChartDrawPicture.ValueToPoint();
                drawPictrueData.ChartDrawPicture.MovePointIndex=drawPictrueData.PointIndex;
                this.JSChartContainer.CurrentChartDrawPicture=drawPictrueData.ChartDrawPicture;
                this.JSChartContainer.SelectChartDrawPicture=drawPictrueData.ChartDrawPicture;
                this.JSChartContainer.OnSelectChartPicture(drawPictrueData.ChartDrawPicture);    //选中画图工具事件
            }
        }

        uielement.ondblclick=function(e)
        {
            var x = e.clientX-this.getBoundingClientRect().left;
            var y = e.clientY-this.getBoundingClientRect().top;

            if(this.JSChartContainer)
                this.JSChartContainer.OnDoubleClick(x,y,e);
        }

        document.onmousemove=function(e)
        {
            if(!this.JSChartContainer) return;
            //加载数据中,禁用鼠标事件
            if (this.JSChartContainer.ChartSplashPaint && this.JSChartContainer.ChartSplashPaint.IsEnableSplash == true) return;

            var drag=this.JSChartContainer.MouseDrag;
            if (!drag) return;

            var moveSetp=Math.abs(drag.LastMove.X-e.clientX);

            if (this.JSChartContainer.CurrentChartDrawPicture)
            {
                var drawPicture=this.JSChartContainer.CurrentChartDrawPicture;
                if (drawPicture.Status==1 || drawPicture.Status==2)
                {
                    if(Math.abs(drag.LastMove.X-e.clientX)<5 && Math.abs(drag.LastMove.Y-e.clientY)<5) return;
                    if(this.JSChartContainer.SetChartDrawPictureSecondPoint(e.clientX,e.clientY))
                    {
                        this.JSChartContainer.DrawDynamicInfo();
                    }
                }
                else if (drawPicture.Status==3)
                {
                    if(this.JSChartContainer.SetChartDrawPictureThirdPoint(e.clientX,e.clientY))
                    {
                        this.JSChartContainer.DrawDynamicInfo();
                    }
                }
                else if (drawPicture.Status==20)    //画图工具移动
                {
                    if(Math.abs(drag.LastMove.X-e.clientX)<5 && Math.abs(drag.LastMove.Y-e.clientY)<5) return;

                    if(this.JSChartContainer.MoveChartDrawPicture(e.clientX-drag.LastMove.X,e.clientY-drag.LastMove.Y))
                    {
                        this.JSChartContainer.DrawDynamicInfo();
                    }
                }

                drag.LastMove.X=e.clientX;
                drag.LastMove.Y=e.clientY;
            }
            else if (this.JSChartContainer.DragMode==1)  //数据左右拖拽
            {
                if (moveSetp<5) return;

                var isLeft=true;
                if (drag.LastMove.X<e.clientX) isLeft=false;//右移数据

                this.JSChartContainer.UIElement.style.cursor="pointer";

                if(this.JSChartContainer.DataMove(moveSetp,isLeft))
                {
                    this.JSChartContainer.UpdataDataoffset();
                    this.JSChartContainer.UpdatePointByCursorIndex();
                    this.JSChartContainer.UpdateFrameMaxMin();
                    this.JSChartContainer.ResetFrameXYSplit();
                    this.JSChartContainer.Draw();
                }

                drag.LastMove.X=e.clientX;
                drag.LastMove.Y=e.clientY;
            }
            else if (this.JSChartContainer.DragMode==2) //区间选择
            {
                var yMoveSetp=Math.abs(drag.LastMove.Y-e.clientY);

                if (moveSetp<5 && yMoveSetp<5) return;

                var x=drag.Click.X-uielement.getBoundingClientRect().left;
                var y=drag.Click.Y-uielement.getBoundingClientRect().top;
                var x2=e.clientX-uielement.getBoundingClientRect().left;
                var y2=e.clientY-uielement.getBoundingClientRect().top;
                this.JSChartContainer.ShowSelectRect(x,y,x2,y2);

                drag.LastMove.X=e.clientX;
                drag.LastMove.Y=e.clientY;
            }
        };

        document.onmouseup=function(e)
        {
            //清空事件
            document.onmousemove=null;
            document.onmouseup=null;

            var bClearDrawPicture=true;
            if (this.JSChartContainer && this.JSChartContainer.CurrentChartDrawPicture)
            {
                var drawPicture=this.JSChartContainer.CurrentChartDrawPicture;
                if (drawPicture.Status==2 || drawPicture.Status==1 || drawPicture.Status==3)
                {
                    drawPicture.PointStatus=drawPicture.Status;
                    if (this.JSChartContainer.FinishChartDrawPicturePoint())
                        this.JSChartContainer.DrawDynamicInfo();
                    else
                        bClearDrawPicture=false;
                }
                else if (drawPicture.Status==20)
                {
                    if (this.JSChartContainer.FinishMoveChartDrawPicture())
                        this.JSChartContainer.DrawDynamicInfo();
                }
            }
            else if (this.JSChartContainer && this.JSChartContainer.DragMode==2)  //区间选择
            {
                var drag=this.JSChartContainer.MouseDrag;

                var selectData=new SelectRectData();
                //区间起始位置 结束位子
                selectData.XStart=drag.Click.X-uielement.getBoundingClientRect().left;
                selectData.XEnd=drag.LastMove.X-uielement.getBoundingClientRect().left;
                selectData.JSChartContainer=this.JSChartContainer;
                selectData.Stock={Symbol:this.JSChartContainer.Symbol, Name:this.JSChartContainer.Name};

                if (this.JSChartContainer.GetSelectRectData(selectData))
                {
                    if (!this.JSChartContainer.SelectRectRightMenu) return;
                    e.data=
                    {
                        Chart:this.JSChartContainer,
                        X:drag.LastMove.X-uielement.getBoundingClientRect().left,
                        Y:drag.LastMove.Y-uielement.getBoundingClientRect().top,
                        SelectData:selectData,          //区间选择的数据
                    };
                    this.JSChartContainer.SelectRectRightMenu.DoModal(e);
                    /*
                    rectContextMenu.show({
                        x:drag.LastMove.X,
                        y:drag.LastMove.Y,
                        position:_self.Frame.Position,
                        data: [{
                            text: "区间统计",
                            click: function (selectData){
                                selectData.JSChartContainer.HideSelectRect();
                                Interval.show(selectData);
                            }},{
                                text:'形态选股',
                                click:function(selectData){
                                    selectData.JSChartContainer.HideSelectRect();
                                    //形态选股
                                    //选出相似度>.90的股票
                                    var scopeData={Plate:["CNA.ci"],Minsimilar:0.85};
                                    Common.showLoad();
                                    selectData.JSChartContainer.RequestKLineMatch(selectData,scopeData,function(data){
                                        KLineMatch.show(data);
                                    });
                                }

                            }],

                        returnData:selectData
                    });
                    */

                    //形态选股
                    //选出相似度>.90的股票
                    //var scopeData={Plate:["S24.ci"],Minsimilar:0.85};
                    //this.JSChartContainer.RequestKLineMatch(this.JSChartContainer,selectData,scopeData);
                }
            }

            //清空数据
            this.JSChartContainer.UIElement.style.cursor="default";
            this.JSChartContainer.MouseDrag=null;
            if (bClearDrawPicture===true) this.JSChartContainer.CurrentChartDrawPicture=null;
            this.JSChartContainer=null;
        }
    }

    //判断是单个手指
    this.IsPhoneDragging=function(e)
    {
        // console.log(e);
        var changed=e.changedTouches.length;
        var touching=e.touches.length;

        return changed==1 && touching==1;
    }

    //是否是2个手指操所
    this.IsPhonePinching=function(e)
    {
        var changed=e.changedTouches.length;
        var touching=e.touches.length;

        return (changed==1 || changed==2) && touching==2;
    }

    this.GetToucheData=function(e, isForceLandscape)
    {
        var touches=new Array();
        var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
        for(var i=0; i<e.touches.length; ++i)
        {
            var item=e.touches[i];
            if (isForceLandscape)
            {
                touches.push(
                    {
                        clientX:item.clientY*pixelTatio, clientY:item.clientX*pixelTatio, 
                        pageX:item.pageY*pixelTatio, pageY:item.pageX*pixelTatio
                    });
            }
            else
            {
                touches.push(
                    {
                        clientX:item.clientX*pixelTatio, clientY:item.clientY*pixelTatio, 
                        pageX:item.pageX*pixelTatio, pageY:item.pageY*pixelTatio
                    });
            }
        }

        return touches;
    }

    //手机拖拽
    uielement.ontouchstart=function(e)
    {
        if(!this.JSChartContainer) return;
        if(this.JSChartContainer.DragMode==0) return;

        this.JSChartContainer.PhonePinch=null;

        e.preventDefault();
        var jsChart=this.JSChartContainer;

        if (jsChart.IsPhoneDragging(e))
        {
            //长按2秒,十字光标
            var timeout=setTimeout(function()
            {
                if (drag.Click.X==drag.LastMove.X && drag.Click.Y==drag.LastMove.Y) //手指没有移动，出现十字光标
                {
                    var mouseDrag=jsChart.MouseDrag;
                    jsChart.MouseDrag=null;
                    //移动十字光标
                    var pixelTatio = GetDevicePixelRatio();
                    var x = drag.Click.X-uielement.getBoundingClientRect().left*pixelTatio;
                    var y = drag.Click.Y-uielement.getBoundingClientRect().top*pixelTatio;
                    jsChart.OnMouseMove(x,y,e);
                }

            }, 1000);

            var drag=
            {
                "Click":{},
                "LastMove":{}  //最后移动的位置
            };

            var touches=jsChart.GetToucheData(e,jsChart.IsForceLandscape);

            drag.Click.X=touches[0].clientX;
            drag.Click.Y=touches[0].clientY;
            drag.LastMove.X=touches[0].clientX;
            drag.LastMove.Y=touches[0].clientY;

            this.JSChartContainer.MouseDrag=drag;
            document.JSChartContainer=this.JSChartContainer;
            this.JSChartContainer.SelectChartDrawPicture=null;
            if (this.JSChartContainer.CurrentChartDrawPicture)  //画图工具模式
            {
                return;
            }
        }
        else if (jsChart.IsPhonePinching(e))
        {
            var phonePinch=
            {
                "Start":{},
                "Last":{}
            };

            var touches=jsChart.GetToucheData(e,jsChart.IsForceLandscape);

            phonePinch.Start={"X":touches[0].pageX,"Y":touches[0].pageY,"X2":touches[1].pageX,"Y2":touches[1].pageY};
            phonePinch.Last={"X":touches[0].pageX,"Y":touches[0].pageY,"X2":touches[1].pageX,"Y2":touches[1].pageY};

            this.JSChartContainer.PhonePinch=phonePinch;
            document.JSChartContainer=this.JSChartContainer;
            this.JSChartContainer.SelectChartDrawPicture=null;
        }

        uielement.ontouchmove=function(e)
        {
            if(!this.JSChartContainer) return;
            e.preventDefault();

            var touches=jsChart.GetToucheData(e,this.JSChartContainer.IsForceLandscape);

            if (jsChart.IsPhoneDragging(e))
            {
                var drag=this.JSChartContainer.MouseDrag;
                if (drag==null)
                {
                    var pixelTatio = GetDevicePixelRatio();
                    var x = touches[0].clientX-this.getBoundingClientRect().left*pixelTatio;
                    var y = touches[0].clientY-this.getBoundingClientRect().top*pixelTatio;
                    if (this.JSChartContainer.IsForceLandscape) y=this.getBoundingClientRect().width-touches[0].clientY;    //强制横屏Y计算
                    this.JSChartContainer.OnMouseMove(x,y,e);
                }
                else
                {
                    var moveSetp=Math.abs(drag.LastMove.X-touches[0].clientX);
                    moveSetp=parseInt(moveSetp);
                    if (this.JSChartContainer.DragMode==1)  //数据左右拖拽
                    {
                        if (moveSetp<5) return;

                        var isLeft=true;
                        if (drag.LastMove.X<touches[0].clientX) isLeft=false;//右移数据

                        if(this.JSChartContainer.DataMove(moveSetp,isLeft))
                        {
                            this.JSChartContainer.UpdataDataoffset();
                            this.JSChartContainer.UpdatePointByCursorIndex();
                            this.JSChartContainer.UpdateFrameMaxMin();
                            this.JSChartContainer.ResetFrameXYSplit();
                            this.JSChartContainer.Draw();
                        }

                        drag.LastMove.X=touches[0].clientX;
                        drag.LastMove.Y=touches[0].clientY;
                    }
                }
            }else if (jsChart.IsPhonePinching(e))
            {
                var phonePinch=this.JSChartContainer.PhonePinch;
                if (!phonePinch) return;

                var yHeight=Math.abs(touches[0].pageY-touches[1].pageY);
                var yLastHeight=Math.abs(phonePinch.Last.Y-phonePinch.Last.Y2);
                var yStep=yHeight-yLastHeight;
                if (Math.abs(yStep)<5) return;

                if (yStep>0)    //放大
                {
                    var cursorIndex={};
                    cursorIndex.Index=parseInt(Math.abs(this.JSChartContainer.CursorIndex-0.5).toFixed(0));
                    if (!this.JSChartContainer.Frame.ZoomUp(cursorIndex)) return;
                    this.JSChartContainer.CursorIndex=cursorIndex.Index;
                    this.JSChartContainer.UpdatePointByCursorIndex();
                    this.JSChartContainer.UpdataDataoffset();
                    this.JSChartContainer.UpdateFrameMaxMin();
                    this.JSChartContainer.Draw();
                    this.JSChartContainer.ShowTooltipByKeyDown();
                }
                else        //缩小
                {
                    var cursorIndex={};
                    cursorIndex.Index=parseInt(Math.abs(this.JSChartContainer.CursorIndex-0.5).toFixed(0));
                    if (!this.JSChartContainer.Frame.ZoomDown(cursorIndex)) return;
                    this.JSChartContainer.CursorIndex=cursorIndex.Index;
                    this.JSChartContainer.UpdataDataoffset();
                    this.JSChartContainer.UpdatePointByCursorIndex();
                    this.JSChartContainer.UpdateFrameMaxMin();
                    this.JSChartContainer.Draw();
                    this.JSChartContainer.ShowTooltipByKeyDown();
                }

                phonePinch.Last={"X":touches[0].pageX,"Y":touches[0].pageY,"X2":touches[1].pageX,"Y2":touches[1].pageY};
            }
        };

        uielement.ontouchend=function(e)
        {
            clearTimeout(timeout);
        }

    }

    this.Draw=function()
    {
        this.Canvas.clearRect(0,0,this.UIElement.width,this.UIElement.height);
        var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
        this.Canvas.lineWidth=pixelTatio;       //手机端需要根据分辨率比调整线段宽度

        if (this.ChartSplashPaint && this.ChartSplashPaint.IsEnableSplash)
        {
            this.Frame.Draw();
            this.ChartSplashPaint.Draw();
            return;
        }
        //框架
        this.Frame.Draw();

        //框架内图形
        for (var i in this.ChartPaint)
        {
            var item=this.ChartPaint[i];
            if (item.IsDrawFirst)
                item.Draw();
        }

        for(var i in this.ChartPaint)
        {
            var item=this.ChartPaint[i];
            if (!item.IsDrawFirst)
                item.Draw();
        }

        for(var i in this.ChartPaintEx)
        {
            var item=this.ChartPaintEx[i];
            item.Draw();
        }

        //叠加股票
        for(var i in this.OverlayChartPaint)
        {
            var item=this.OverlayChartPaint[i];
            item.Draw();
        }

        //固定扩展图形
        for(var i in this.ExtendChartPaint)
        {
            var item=this.ExtendChartPaint[i];
            if (!item.IsDynamic) item.Draw();
        }

        if (this.Frame.DrawInsideHorizontal) this.Frame.DrawInsideHorizontal();
        this.Frame.DrawLock();
        this.Frame.Snapshot();

        for(var i in this.ExtendChartPaint) //动态扩展图形
        {
            var item=this.ExtendChartPaint[i];
            if (item.IsDynamic) item.Draw();
        }

        if (this.LastPoint.X!=null || this.LastPoint.Y!=null)
        {
            if (this.ChartCorssCursor)
            {
                this.ChartCorssCursor.LastPoint=this.LastPoint;
                this.ChartCorssCursor.Draw();
            }
        }

        for(var i in this.TitlePaint)
        {
            var item=this.TitlePaint[i];
            if (!item.IsDynamic) continue;

            item.CursorIndex=this.CursorIndex;
            item.Draw();
        }

        for(var i in this.ChartDrawPicture)
        {
            var item=this.ChartDrawPicture[i];
            item.Draw();
        }

        if (this.CurrentChartDrawPicture && this.CurrentChartDrawPicture.Status!=10)
        {
            this.CurrentChartDrawPicture.Draw();
        }

    }

    //画动态信息
    this.DrawDynamicInfo=function()
    {
        if (this.Frame.ScreenImageData==null) return;

        var isErase=false;
        if (this.ChartCorssCursor)
        {
            if (this.ChartCorssCursor.PointX!=null || this.ChartCorssCursor.PointY!=null)
                isErase=true;
        }

        if (isErase) this.Canvas.putImageData(this.Frame.ScreenImageData,0,0);

        for(var i in this.ExtendChartPaint)    //动态扩展图形
        {
            var item=this.ExtendChartPaint[i];
            if (item.IsDynamic) item.Draw();
        }

        if (this.ChartCorssCursor)
        {
            this.ChartCorssCursor.LastPoint=this.LastPoint;
            this.ChartCorssCursor.Draw();
        }

        for(var i in this.TitlePaint)
        {
            var item=this.TitlePaint[i];
            if (!item.IsDynamic) continue;

            item.CursorIndex=this.CursorIndex;
            item.Draw();
        }

        for(var i in this.ChartDrawPicture)
        {
            var item=this.ChartDrawPicture[i];
            item.Draw();
        }

        if (this.CurrentChartDrawPicture && this.CurrentChartDrawPicture.Status!=10)
        {
            this.CurrentChartDrawPicture.Draw();
        }
    }

    this.OnMouseMove=function(x,y,e)
    {
        this.LastPoint.X=x;
        this.LastPoint.Y=y;
        this.CursorIndex=this.Frame.GetXData(x);

        var bDrawPicture=false; //是否正在画图
        if (this.CurrentChartDrawPicture)
        {
            if (this.CurrentChartDrawPicture.SetLastPoint) this.CurrentChartDrawPicture.SetLastPoint({X:x,Y:y});
            bDrawPicture=true;
        }
        else
        {
            var drawPictrueData={};
            drawPictrueData.X=x;
            drawPictrueData.Y=y;
            if (this.GetChartDrawPictureByPoint(drawPictrueData)) 
            {
                if (drawPictrueData.PointIndex===100) this.UIElement.style.cursor="move";
                else this.UIElement.style.cursor="pointer";
                bDrawPicture=true;
            }
            else 
            {
                if (!this.MouseDrag) this.UIElement.style.cursor="default";
            }
        }

        this.DrawDynamicInfo();

        if (this.IsShowTooltip && bDrawPicture==false)
        {
            var toolTip=new TooltipData();
            for(var i in this.ChartPaint)
            {
                var item=this.ChartPaint[i];
                if (item.GetTooltipData(x,y,toolTip))
                {
                    break;
                }
            }

            if (!toolTip.Data)
            {
                for(var i in this.OverlayChartPaint)
                {
                    var item=this.OverlayChartPaint[i];
                    if (item.GetTooltipData(x,y,toolTip))
                    {
                        break;
                    }
                }
            }

            if (toolTip.Data)
            {
                this.ShowTooltip(x,y,toolTip);
            }
            else
            {
                this.HideTooltip();
            }
        }
    }

    this.OnKeyDown=function(e)
    {
        var keyID = e.keyCode ? e.keyCode :e.which;
        switch(keyID)
        {
            case 37: //left
                if (this.CursorIndex<=0.99999)
                {
                    if (!this.DataMoveLeft()) break;
                    this.UpdataDataoffset();
                    this.UpdatePointByCursorIndex();
                    this.UpdateFrameMaxMin();
                    this.Draw();
                    this.ShowTooltipByKeyDown();
                }
                else
                {
                    --this.CursorIndex;
                    this.UpdatePointByCursorIndex();
                    this.DrawDynamicInfo();
                    this.ShowTooltipByKeyDown();
                }
                break;
            case 39: //right
                var xPointcount=0;
                if (this.Frame.XPointCount) xPointcount=this.Frame.XPointCount;
                else xPointcount=this.Frame.SubFrame[0].Frame.XPointCount;
                if (this.CursorIndex+1>=xPointcount)
                {
                    if (!this.DataMoveRight()) break;
                    this.UpdataDataoffset();
                    this.UpdatePointByCursorIndex();
                    this.UpdateFrameMaxMin();
                    this.Draw();
                    this.ShowTooltipByKeyDown();
                }
                else
                {
                    //判断是否在最后一个数据上
                    var data=null;
                    if (this.Frame.Data) data=this.Frame.Data;
                    else data=this.Frame.SubFrame[0].Frame.Data;
                    if (!data) break;
                    if (this.CursorIndex+data.DataOffset+1>=data.Data.length) break;

                    ++this.CursorIndex;
                    this.UpdatePointByCursorIndex();
                    this.DrawDynamicInfo();
                    this.ShowTooltipByKeyDown();
                }
                break;
            case 38:    //up
                var cursorIndex={};
                cursorIndex.Index=parseInt(Math.abs(this.CursorIndex-0.5).toFixed(0));
                if (!this.Frame.ZoomUp(cursorIndex)) break;
                this.CursorIndex=cursorIndex.Index;
                this.UpdatePointByCursorIndex();
                this.UpdataDataoffset();
                this.UpdateFrameMaxMin();
                this.Draw();
                this.ShowTooltipByKeyDown();
                break;
            case 40:    //down
                var cursorIndex={};
                cursorIndex.Index=parseInt(Math.abs(this.CursorIndex-0.5).toFixed(0));
                if (!this.Frame.ZoomDown(cursorIndex)) break;
                this.CursorIndex=cursorIndex.Index;
                this.UpdataDataoffset();
                this.UpdatePointByCursorIndex();
                this.UpdateFrameMaxMin();
                this.Draw();
                this.ShowTooltipByKeyDown();
                break;
            case 46:    //del
                if (!this.SelectChartDrawPicture) break;
                var drawPicture=this.SelectChartDrawPicture;
                console.log(drawPicture,"drawPicturedrawPicturedrawPicture")
                this.SelectChartDrawPicture=null;
                this.ClearChartDrawPicture(drawPicture);    //删除选中的画图工具
                break;
            default:
                return;
        }

        //不让滚动条滚动
        if(e.preventDefault) e.preventDefault();
        else e.returnValue = false;
    }

    this.OnDoubleClick=function(x,y,e)
    {
        //console.log(e);
    }

    this.UpdatePointByCursorIndex=function()
    {
        this.LastPoint.X=this.Frame.GetXFromIndex(this.CursorIndex);

        var index=Math.abs(this.CursorIndex-0.5);
        index=parseInt(index.toFixed(0));
        var data=this.Frame.Data;
        if (data.DataOffset+index>=data.Data.length)
        {
            return;
        }
        var close=data.Data[data.DataOffset+index].Close;

        this.LastPoint.Y=this.Frame.GetYFromData(close);
    }

    this.ShowTooltipByKeyDown=function()
    {
        var index=Math.abs(this.CursorIndex-0.5);
        index=parseInt(index.toFixed(0));
        var data=this.Frame.Data;

        var toolTip=new TooltipData();
        toolTip.Data=data.Data[data.DataOffset+index];
        toolTip.ChartPaint=this.ChartPaint[0];

        this.ShowTooltip(this.LastPoint.X,this.LastPoint.Y,toolTip);
    }

    this.ShowTooltip=function(x,y,toolTip)
    {
        if (!this.IsShowTooltip) return;

        var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
        var xMove=15*pixelTatio;    //顶部坐标偏移位置
        if (toolTip.Type===0) //K线信息
        {
            var format=new HistoryDataStringFormat();
            format.Value=toolTip;
            format.Symbol=this.Symbol;
            if (!format.Operator()) return;

            var scrollPos=GetScrollPosition();
            var left = x;
            var top = y;
            var width=157;
            this.Tooltip.style.width = width+"px";
            this.Tooltip.style.height =200+"px";
            if (toolTip.ChartPaint.Name=="Overlay-KLine")  this.Tooltip.style.height =220+"px";
            this.Tooltip.style.position = "absolute";
            if (left+width>this.UIElement.getBoundingClientRect().right+scrollPos.Left)
                this.Tooltip.style.left = (left-width) + "px";
            else
                this.Tooltip.style.left = left + "px";
            this.Tooltip.style.top = (top + xMove)+ "px";
            this.Tooltip.className='jschart-tooltip';
            this.Tooltip.innerHTML=format.Text;
            this.Tooltip.style.display = "block";
        }
        else if (toolTip.Type===1)   //信息地雷提示信息
        {
            var scrollPos=GetScrollPosition();
            var left = x;
            var top = y;
            var width=500;
            var format=new KLineInfoDataStringFormat();
            format.Value=toolTip;
            format.Symbol=this.Symbol;
            if (!format.Operator()) return;

            this.Tooltip.className='jchart-klineinfo-tooltip';
            this.Tooltip.style.position = "absolute";
            this.Tooltip.style.left = left + "px";
            this.Tooltip.style.top = (top +xMove)+ "px";
            this.Tooltip.style.width = null;
            this.Tooltip.style.height =null;
            this.Tooltip.innerHTML=format.Text;
            this.Tooltip.style.display = "block";
        }
    }

    this.HideTooltip=function()
    {
        this.Tooltip.style.display = "none";
    }

    this.ShowSelectRect=function(x,y,x2,y2)
    {
        var left = x;
        var top = y;

        var borderRight=this.Frame.ChartBorder.GetRight();
        var borderLeft=this.Frame.ChartBorder.GetLeft();

        if (x>borderRight) x=borderRight;
        if (x2>borderRight) x2=borderRight;

        if (x<borderLeft) x=borderLeft;
        if (x2<borderLeft) x2=borderLeft;

        if (x>x2) left=x2;
        if (y>y2) top=y2;

        var width=Math.abs(x-x2);
        var height=Math.abs(y-y2);

        this.SelectRect.style.width = width+"px";
        this.SelectRect.style.height =height+"px";
        this.SelectRect.style.position = "absolute";
        this.SelectRect.style.left = left +"px";
        this.SelectRect.style.top = top +"px";
        this.SelectRect.style.display = "block";
    }

    this.UpdateSelectRect=function(start,end)
    {
        if (!this.ChartPaint[0].Data) return;

        var data=this.ChartPaint[0].Data;
        var offset=data.DataOffset;
        var fixedStart=start-offset;
        var fixedEnd=end-offset;
        var x=this.Frame.GetXFromIndex(fixedStart);
        var x2=this.Frame.GetXFromIndex(fixedEnd);

        console.log('[JSChartContainer::UpdateSelectRect]',start,end,x,x2);
        var scrollPos=GetScrollPosition();
        this.SelectRect.style.left = x + scrollPos.Left+"px";
        this.SelectRect.style.width = (x2-x)+"px";
    }

    this.HideSelectRect=function()
    {
        this.SelectRect.style.display = "none";
    }

    this.ResetFrameXYSplit=function()
    {
        if (typeof(this.Frame.ResetXYSplit)=='function')
            this.Frame.ResetXYSplit();
    }

    this.UpdateFrameMaxMin=function()
    {
        var frameMaxMinData=new Array();

        var chartPaint=new Array();

        for(var i in this.ChartPaint)
        {
            chartPaint.push(this.ChartPaint[i]);
        }
        for(var i in this.OverlayChartPaint)
        {
            chartPaint.push(this.OverlayChartPaint[i]);
        }

        for(var i in chartPaint)
        {
            var paint=chartPaint[i];
            var range=paint.GetMaxMin();
            if (range==null || range.Max==null || range.Min==null) continue;
            var frameItem=null;
            for(var j in frameMaxMinData)
            {
                if (frameMaxMinData[j].Frame==paint.ChartFrame)
                {
                    frameItem=frameMaxMinData[j];
                    break;
                }
            }

            if (frameItem)
            {
                if (frameItem.Range.Max<range.Max) frameItem.Range.Max=range.Max;
                if (frameItem.Range.Min>range.Min) frameItem.Range.Min=range.Min;
            }
            else
            {
                frameItem={};
                frameItem.Frame=paint.ChartFrame;
                frameItem.Range=range;
                frameMaxMinData.push(frameItem);
            }
        }

        for(var i in frameMaxMinData)
        {
            var item=frameMaxMinData[i];
            if (!item.Frame || !item.Range) continue;
            if (item.Range.Max==null || item.Range.Min==null) continue;
            if (item.Frame.YSpecificMaxMin)
            {
                item.Frame.HorizontalMax=item.Frame.YSpecificMaxMin.Max;
                item.Frame.HorizontalMin=item.Frame.YSpecificMaxMin.Min;
            }
            else
            {
                item.Frame.HorizontalMax=item.Range.Max;
                item.Frame.HorizontalMin=item.Range.Min;
            }
            item.Frame.XYSplit=true;
        }
    }

    this.DataMoveLeft=function()
    {
        var data=null;
        if (!this.Frame.Data) data=this.Frame.Data;
        else data=this.Frame.SubFrame[0].Frame.Data;
        if (!data) return false;
        if (data.DataOffset<=0) return false;
        --data.DataOffset;
        return true;
    }

    this.DataMoveRight=function()
    {
        var data=null;
        if (!this.Frame.Data) data=this.Frame.Data;
        else data=this.Frame.SubFrame[0].Frame.Data;
        if (!data) return false;

        var xPointcount=0;
        if (this.Frame.XPointCount) xPointcount=this.Frame.XPointCount;
        else xPointcount=this.Frame.SubFrame[0].Frame.XPointCount;
        if (!xPointcount) return false;

        if (xPointcount+data.DataOffset>=data.Data.length) return false;

        ++data.DataOffset;
        return true;
    }

    this.UpdataDataoffset=function()
    {
        var data=null;
        if (this.Frame.Data)
            data=this.Frame.Data;
        else
            data=this.Frame.SubFrame[0].Frame.Data;

        if (!data) return;

        for(var i in this.ChartPaint)
        {
            var item =this.ChartPaint[i];
            if (!item.Data) continue;
            item.Data.DataOffset=data.DataOffset;
        }

        for(var i in this.OverlayChartPaint)
        {
            var item =this.OverlayChartPaint[i];
            if (!item.Data) continue;
            item.Data.DataOffset=data.DataOffset;
        }
    }

    this.DataMove=function(step,isLeft)
    {
        step=parseInt(step/4);  //除以4个像素
        if (step<=0) return false;

        var data=null;
        if (!this.Frame.Data) data=this.Frame.Data;
        else data=this.Frame.SubFrame[0].Frame.Data;
        if (!data) return false;

        var xPointcount=0;
        if (this.Frame.XPointCount) xPointcount=this.Frame.XPointCount;
        else xPointcount=this.Frame.SubFrame[0].Frame.XPointCount;
        if (!xPointcount) return false;

        if (isLeft) //-->
        {
            if (xPointcount+data.DataOffset>=data.Data.length) return false;

            data.DataOffset+=step;

            if (data.DataOffset+xPointcount>=data.Data.length)
                data.DataOffset=data.Data.length-xPointcount;

            return true;
        }
        else        //<--
        {
            if (data.DataOffset<=0) return false;

            data.DataOffset-=step;
            if (data.DataOffset<0) data.DataOffset=0;

            return true;
        }
    }

    //获取鼠标在当前子窗口id
    this.GetSubFrameIndex=function(x,y)
    {
        if (!this.Frame.SubFrame || this.Frame.SubFrame.length<=0) return -1;

        for(var i in this.Frame.SubFrame)
        {
            var frame=this.Frame.SubFrame[i].Frame;
            var left=frame.ChartBorder.GetLeft();
            var top=frame.ChartBorder.GetTop();
            var height=frame.ChartBorder.GetHeight();
            var width=frame.ChartBorder.GetWidth();

            this.Canvas.beginPath();
            this.Canvas.rect(left,top,width,height);
            if (this.Canvas.isPointInPath(x,y)) return parseInt(i);

        }
        return 0;
    }

    //根据X坐标获取数据索引
    this.GetDataIndexByPoint=function(x)
    {
        var frame=this.Frame;
        if (this.Frame.SubFrame && this.Frame.SubFrame.length>0) frame=this.Frame.SubFrame[0].Frame;

        var data=null;
        if (this.Frame.Data)
            data=this.Frame.Data;
        else
            data=this.Frame.SubFrame[0].Frame.Data;

        if (!data || !frame) return;

        var index=parseInt(frame.GetXData(x));

        //console.log('x='+ x +' date='+data.Data[data.DataOffset+index].Date);
        return data.DataOffset+index;
    }

    //获取主数据
    this.GetSelectRectData=function(selectData)
    {
        if (Math.abs(selectData.XStart-selectData.XEnd)<5) return false;

        var data=null;
        if (this.Frame.Data)
            data=this.Frame.Data;
        else
            data=this.Frame.SubFrame[0].Frame.Data;

        if (!data) return false;

        var start=this.GetDataIndexByPoint(selectData.XStart);
        var end=this.GetDataIndexByPoint(selectData.XEnd);

        if (Math.abs(start-end)<2) return false;

        selectData.Data=data;
        if (start>end)
        {
            selectData.Start=end;
            selectData.End=start;
        }
        else
        {
            selectData.Start=start;
            selectData.End=end;
        }

        return true;
    }

    //获取当前的点对应的 画图工具的图形
    //data.X data.Y 鼠标位置  返回 data.ChartDrawPicture 数据在画图工具 data.PointIndex 在画图工具对应点索引
    this.GetChartDrawPictureByPoint=function(data)
    {
        for(var i in this.ChartDrawPicture)
        {
            var item =this.ChartDrawPicture[i];
            var pointIndex=item.IsPointIn(data.X,data.Y);
            if (pointIndex===false) continue;

            if (pointIndex>=0)
            {
                data.ChartDrawPicture=item;
                data.PointIndex=pointIndex;
                return true;
            }
        }

        return false;
    }
}

function GetDevicePixelRatio()
{
    return window.devicePixelRatio || 1;
}

function OnKeyDown(e)   //键盘事件
{
    if(this.JSChartContainer && this.JSChartContainer.OnKeyDown)
        this.JSChartContainer.OnKeyDown(e);
}

function OnWheel(e)    //上下滚动事件
{
    if(this.JSChartContainer && this.JSChartContainer.OnWheel)
        this.JSChartContainer.OnWheel(e);
}

function ToFixed(number, precision)
{
    var b = 1;
    if (isNaN(number)) return number;
    if (number < 0) b = -1;
    var multiplier = Math.pow(10, precision);
    var value=Math.round(Math.abs(number) * multiplier) / multiplier * b;

    var s = value.toString();
    var rs = s.indexOf('.');
    if (rs < 0 && precision>0)
    {
        rs = s.length;
        s += '.';
    }

    while (s.length <= rs + precision)
    {
        s += '0';
    }

    return s;
}

Number.prototype.toFixed = function( precision )
{
    return ToFixed(this,precision)
}

function Guid()
{
    function S4()
    {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function GetScrollPosition()
{
    var scrollPos={};
    var scrollTop=0;
    var scrollLeft=0;
    if(document.documentElement && document.documentElement.scrollTop)
    {
        scrollTop=document.documentElement.scrollTop;
        scrollLeft=document.documentElement.scrollLeft;
    }else if(document.body)
    {
        scrollTop=document.body.scrollTop;
        scrollLeft=document.body.scrollLeft;
    }

    scrollPos.Top=scrollTop;
    scrollPos.Left=scrollLeft;
    return scrollPos;
}

//修正线段有毛刺
function ToFixedPoint(value)
{
    return parseInt(value)+0.5;
}

function ToFixedRect(value)
{
    // With a bitwise or.
    //rounded = (0.5 + somenum) | 0;
    // A double bitwise not.
    //rounded = ~~ (0.5 + somenum);
    // Finally, a left bitwise shift.
    var rounded;
    return rounded = (0.5 + value) << 0;
}



function Point()
{
    this.X;
    this.Y;
}

function SelectRectData()
{
    this.Data;                  //主数据
    this.JSChartContainer;      //行情控件

    this.Start; //数据起始位子
    this.End;   //数据结束位置

    this.XStart;//X坐标起始位置
    this.XEnd;  //X位置结束为止
}

//坐标信息
function CoordinateInfo()
{
    this.Value;                                                 //坐标数据
    this.Message=new Array();                                   //坐标输出文字信息
    this.TextColor=g_JSChartResource.FrameSplitTextColor        //文字颜色
    this.Font=g_JSChartResource.FrameSplitTextFont;             //字体
    this.LineColor=g_JSChartResource.FrameSplitPen;             //线段颜色
    this.LineType=1;                                            //线段类型 -1 不画线段
}


//边框信息
function ChartBorder()
{
    this.UIElement;

    //四周间距
    this.Left=50;
    this.Right=80;
    this.Top=50;
    this.Bottom=50;
    this.TitleHeight=24;    //标题高度
    this.TopSpace=0;
    this.BottomSpace=0;

    this.GetChartWidth=function()
    {
        return this.UIElement.width;
    }

    this.GetChartHeight=function()
    {
        return this.UIElement.height;
    }

    this.GetLeft=function()
    {
        return this.Left;
    }

    this.GetRight=function()
    {
        return this.UIElement.width-this.Right;
    }

    this.GetTop=function()
    {
        return this.Top;
    }

    this.GetTopEx=function()    //去掉标题，上面间距
    {
        return this.Top+this.TitleHeight+this.TopSpace;
    }

    this.GetTopTitle=function() //去掉标题
    {
        return this.Top+this.TitleHeight;
    }

    this.GetBottom=function()
    {
        return this.UIElement.height-this.Bottom;
    }

    this.GetBottomEx=function()
    {
        return this.UIElement.height-this.Bottom-this.BottomSpace;
    }

    this.GetWidth=function()
    {
        return this.UIElement.width-this.Left-this.Right;
    }

    this.GetHeight=function()
    {
        return this.UIElement.height-this.Top-this.Bottom;
    }

    this.GetHeightEx=function() //去掉标题的高度, 上下间距
    {
        return this.UIElement.height-this.Top-this.Bottom-this.TitleHeight-this.TopSpace-this.BottomSpace;
    }

    this.GetRightEx=function()  //横屏去掉标题高度的 上面间距
    {
        return this.UIElement.width-this.Right-this.TitleHeight- this.TopSpace;
    }

    this.GetWidthEx=function()  //横屏去掉标题宽度 上下间距
    {
        return this.UIElement.width-this.Left-this.Right-this.TitleHeight- this.TopSpace - this.BottomSpace;
    }

    this.GetLeftEx = function () //横屏
    {
        return this.Left+this.BottomSpace;
    }

    this.GetRightTitle = function ()//横屏
    {
        return this.UIElement.width - this.Right - this.TitleHeight;
    }

    this.GetTitleHeight=function()
    {
        return this.TitleHeight;
    }
}

function IChartFramePainting()
{
    this.HorizontalInfo=new Array();    //Y轴
    this.VerticalInfo=new Array();      //X轴

    this.Canvas;                        //画布

    this.Identify;                      //窗口标识

    this.ChartBorder;
    this.PenBorder=g_JSChartResource.FrameBorderPen;        //边框颜色
    this.TitleBGColor=g_JSChartResource.FrameTitleBGColor;  //标题背景色
    this.IsShow=true;                   //是否显示
    this.SizeChange=true;               //大小是否改变
    this.XYSplit=true;                  //XY轴坐标信息改变

    this.HorizontalMax;                 //Y轴最大值
    this.HorizontalMin;                 //Y轴最小值
    this.XPointCount=10;                //X轴数据个数

    this.YSplitOperator;               //Y轴分割
    this.XSplitOperator;               //X轴分割
    this.Data;                         //主数据

    this.IsLocked=false;               //是否上锁
    this.LockPaint = null;

    this.YSpecificMaxMin=null;         //指定Y轴最大最小值
    this.IsShowBorder = true;            //是否显示边框

    this.Draw=function()
    {
        this.DrawFrame();
        this.DrawBorder();

        this.SizeChange=false;
        this.XYSplit=false;
    }

    this.DrawFrame=function() { }

    //画边框
    this.DrawBorder=function()
    {
        if (!this.IsShowBorder) return;

        var left=ToFixedPoint(this.ChartBorder.GetLeft());
        var top=ToFixedPoint(this.ChartBorder.GetTop());
        var right=ToFixedPoint(this.ChartBorder.GetRight());
        var bottom=ToFixedPoint(this.ChartBorder.GetBottom());
        var width=right-left;
        var height=bottom-top;

        //console.log('[IChartFramePainting.DrawBorder] bottom',bottom);

        this.Canvas.strokeStyle=this.PenBorder;
        this.Canvas.strokeRect(left,top,width,height);
    }

    //画标题背景色
    this.DrawTitleBG=function()
    {
        if (this.ChartBorder.TitleHeight<=0) return;

        var left=ToFixedPoint(this.ChartBorder.GetLeft());
        var top=ToFixedPoint(this.ChartBorder.GetTop());
        var right=ToFixedPoint(this.ChartBorder.GetRight());
        var bottom=ToFixedPoint(this.ChartBorder.GetTopTitle());
        var width=right-left;
        var height=bottom-top;

        this.Canvas.fillStyle=this.TitleBGColor;
        this.Canvas.fillRect(left,top,width,height);
    }

    this.DrawLock=function()
    {
        if (this.IsLocked)
        {
            if (this.LockPaint == null)
                this.LockPaint = new ChartLock();
            this.LockPaint.Canvas=this.Canvas;
            this.LockPaint.ChartBorder=this.ChartBorder;
            this.LockPaint.ChartFrame=this;
            this.LockPaint.Draw();
        }
    }

    //设施上锁
    this.SetLock=function(lockData)
    {
        if (!lockData)  //空数据不上锁
        {
            this.IsLocked=false;
            return;
        }

        this.IsLocked=true;
        if (!this.LockPaint) this.LockPaint=new ChartLock();    //创建锁

        if (lockData.Callback) this.LockPaint.Callback=lockData.Callback;       //回调
        if (lockData.IndexName) this.LockPaint.IndexName=lockData.IndexName;    //指标名字
        if (lockData.ID) this.LockPaint.LockID=lockData.ID;                     //锁ID
        if (lockData.BG) this.LockPaint.BGColor=lockData.BG;                    //背景色 
        if (lockData.Text) this.LockPaint.Title= lockData.Text;   
        if (lockData.TextColor) this.LockPaint.TextColor=lockData.TextColor;  
        if (lockData.Font) this.LockPaint.Font=lockData.Font;
        if (lockData.Count) this.LockPaint.LockCount=lockData.Count;
    }
}

//空框架只画边框
function NoneFrame()
{
    this.newMethod=IChartFramePainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Snapshot=function()
    {

    }

    this.SetSizeChage=function(sizeChange)
    {
        this.SizeChange=sizeChange;

        //画布的位置
        this.Position={
            X:this.ChartBorder.UIElement.offsetLeft,
            Y:this.ChartBorder.UIElement.offsetTop,
            W:this.ChartBorder.UIElement.clientWidth,
            H:this.ChartBorder.UIElement.clientHeight
        };
    }
}

function AverageWidthFrame()
{
    this.newMethod=IChartFramePainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.DataWidth=50*GetDevicePixelRatio();
    this.DistanceWidth=10*GetDevicePixelRatio();
    this.MinXDistance = 30*GetDevicePixelRatio();       //X轴刻度最小间距
    this.MinYDistance=10*GetDevicePixelRatio();         //Y轴刻度最小间距
    this.CoordinateType=0;  //坐标类型 0=普通坐标 1=反转坐标

    this.DrawFrame=function()
    {
        if (this.XPointCount>0)
        {
            let dInterval=this.ChartBorder.GetWidth()/(6*this.XPointCount); //分6份, 数据4 间距2
            this.DistanceWidth=2*dInterval;
			this.DataWidth=4*dInterval;
        }

        this.DrawHorizontal();
        this.DrawVertical();
    }

    //isLimit 是否限制在当前坐标下
    this.GetYFromData=function(value, isLimit)
    {
        if (isLimit===false)
        {
            if (this.CoordinateType==1)
            {
                var height=this.ChartBorder.GetHeightEx()*(value-this.HorizontalMin)/(this.HorizontalMax-this.HorizontalMin);
                return this.ChartBorder.GetTopEx()+height;
            }
            else
            {
                var height=this.ChartBorder.GetHeightEx()*(value-this.HorizontalMin)/(this.HorizontalMax-this.HorizontalMin);
                return this.ChartBorder.GetBottomEx()-height;
            }
        }
        else
        {
            if (this.CoordinateType==1)
            {
                if(value<=this.HorizontalMin) return this.ChartBorder.GetTopEx();
                if(value>=this.HorizontalMax) return this.ChartBorder.GetBottomEx();

                var height=this.ChartBorder.GetHeightEx()*(value-this.HorizontalMin)/(this.HorizontalMax-this.HorizontalMin);
                return this.ChartBorder.GetTopEx()+height;
            }
            else
            {
                if(value<=this.HorizontalMin) return this.ChartBorder.GetBottomEx();
                if(value>=this.HorizontalMax) return this.ChartBorder.GetTopEx();

                var height=this.ChartBorder.GetHeightEx()*(value-this.HorizontalMin)/(this.HorizontalMax-this.HorizontalMin);
                return this.ChartBorder.GetBottomEx()-height;
            }
        }
    }

    //画Y轴
    this.DrawHorizontal=function()
    {
        var left=this.ChartBorder.GetLeft();
        var right=this.ChartBorder.GetRight();
        var bottom = this.ChartBorder.GetBottom();
        var top = this.ChartBorder.GetTopTitle();
        var borderRight=this.ChartBorder.Right;
        var borderLeft=this.ChartBorder.Left;

        var yPrev=null; //上一个坐标y的值
        for(var i=this.HorizontalInfo.length-1; i>=0; --i)  //从上往下画分割线
        {
            var item=this.HorizontalInfo[i];
            var y=this.GetYFromData(item.Value);
            if (y!=null && Math.abs(y-yPrev)<this.MinYDistance) continue;  //两个坐标在近了 就不画了

            this.Canvas.strokeStyle=item.LineColor;
            this.Canvas.beginPath();
            this.Canvas.moveTo(left,ToFixedPoint(y));
            this.Canvas.lineTo(right,ToFixedPoint(y));
            this.Canvas.stroke();

            if (y >= bottom - 2) this.Canvas.textBaseline = 'bottom';
            else if (y <= top + 2) this.Canvas.textBaseline = 'top';
            else this.Canvas.textBaseline = "middle";

            //坐标信息 左边 间距小于10 不画坐标
            if (item.Message[0]!=null && borderLeft>10)
            {
                if (item.Font!=null) this.Canvas.font=item.Font;

                this.Canvas.fillStyle=item.TextColor;
                this.Canvas.textAlign="right";
                this.Canvas.fillText(item.Message[0],left-2,y);
            }

            //坐标信息 右边 间距小于10 不画坐标
            if (item.Message[1]!=null && borderRight>10)
            {
                if (item.Font!=null) this.Canvas.font=item.Font;

                this.Canvas.fillStyle=item.TextColor;
                this.Canvas.textAlign="left";
                this.Canvas.fillText(item.Message[1],right+2,y);
            }

            yPrev=y;
        }
    }

    //Y刻度画在左边内部
    this.DrawInsideHorizontal = function () 
    {
        if (this.IsHScreen===true) return;  //横屏不画

        var left = this.ChartBorder.GetLeft();
        var right = this.ChartBorder.GetRight();
        var bottom = this.ChartBorder.GetBottom();
        var top = this.ChartBorder.GetTopTitle();
        var borderRight = this.ChartBorder.Right;
        var borderLeft = this.ChartBorder.Left;
        var titleHeight = this.ChartBorder.TitleHeight;
        if (borderLeft >= 10) return;

        var pixelTatio = GetDevicePixelRatio();
        var yPrev = null; //上一个坐标y的值
        for (var i = this.HorizontalInfo.length - 1; i >= 0; --i)  //从上往下画分割线
        {
            var item = this.HorizontalInfo[i];
            var y = this.GetYFromData(item.Value);
            if (y != null && Math.abs(y - yPrev) < this.MinYDistance) continue;  //两个坐标在近了 就不画了

            //坐标信息 左边 间距小于10 画在内部
            if (item.Message[0] != null && borderLeft < 10) 
            {
                if (item.Font != null) this.Canvas.font = item.Font;
                this.Canvas.fillStyle = item.TextColor;
                this.Canvas.textAlign = "left";
                if (y >= bottom - 2) this.Canvas.textBaseline = 'bottom';
                else if (y <= top + 2) this.Canvas.textBaseline = 'top';
                else this.Canvas.textBaseline = "middle";
                this.Canvas.fillText(item.Message[0], left + 1*pixelTatio, y);
            }

            yPrev = y;
        }
    }

    this.GetXFromIndex=function(index)
    {
        var count=this.XPointCount;

        if (count==1)
        {
            if (index==0) return this.ChartBorder.GetLeft();
            else return this.ChartBorder.GetRight();
        }
        else if (count<=0)
        {
            return this.ChartBorder.GetLeft();
        }
        else if (index>=count)
        {
            return this.ChartBorder.GetRight();
        }
        else
        {
            var offset=this.ChartBorder.GetLeft()+this.ChartBorder.GetWidth()*index/count;
            return offset;
        }
    }

    //画X轴
    this.DrawVertical=function()
    {
        var top=this.ChartBorder.GetTopTitle();
        var bottom=this.ChartBorder.GetBottom();
        var right=this.ChartBorder.GetRight();
        var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
        //console.log('[AverageWidthFrame.DrawVertical] bottom',bottom);

        var xPrev=null; //上一个坐标x的值
        for(var i in this.VerticalInfo)
        {
            var x=this.GetXFromIndex(this.VerticalInfo[i].Value);
            if (x>right) break;
            if (xPrev!=null && Math.abs(x-xPrev)<this.MinXDistance) continue;
            
            if (this.VerticalInfo[i].LineType>0)
            {
                this.Canvas.strokeStyle=this.VerticalInfo[i].LineColor;
                this.Canvas.beginPath();
                this.Canvas.moveTo(ToFixedPoint(x),top);
                this.Canvas.lineTo(ToFixedPoint(x),bottom);
                this.Canvas.stroke();
            }

            if (this.VerticalInfo[i].Message[0]!=null)
            {
                if (this.VerticalInfo[i].Font!=null)
                    this.Canvas.font=this.VerticalInfo[i].Font;

                this.Canvas.fillStyle=this.VerticalInfo[i].TextColor;
                var testWidth=this.Canvas.measureText(this.VerticalInfo[i].Message[0]).width;
                if (x<testWidth/2)
                {
                    this.Canvas.textAlign="left";
                    this.Canvas.textBaseline="top";
                }
                else if ((x + testWidth / 2) >= this.ChartBorder.GetChartWidth())
                {
                    this.Canvas.textAlign = "right";
                    this.Canvas.textBaseline="top";
                }
                else
                {
                    this.Canvas.textAlign="center";
                    this.Canvas.textBaseline="top";
                }
                this.Canvas.fillText(this.VerticalInfo[i].Message[0],x,bottom+1*pixelTatio);
            }

            xPrev=x;
        }
    }

    //Y坐标转y轴数值
    this.GetYData=function(y)
    {
        if (this.CoordinateType==1) //反转坐标
        {
            if (y<this.ChartBorder.GetTopEx()) return this.HorizontalMin;
            if (y>this.ChartBorder.GetBottomEx()) return this.HorizontalMax;

            return (y-this.ChartBorder.GetTopEx())/this.ChartBorder.GetHeightEx()*(this.HorizontalMax-this.HorizontalMin)+this.HorizontalMin;
        }
        else
        {
            if (y<this.ChartBorder.GetTopEx()) return this.HorizontalMax;
            if (y>this.ChartBorder.GetBottomEx()) return this.HorizontalMin;

            return (this.ChartBorder.GetBottomEx()-y)/this.ChartBorder.GetHeightEx()*(this.HorizontalMax-this.HorizontalMin)+this.HorizontalMin;
        }
    }

    //X坐标转x轴数值
    this.GetXData=function(x)
    {
        if (x<=this.ChartBorder.GetLeft()) return 0;
		if (x>=this.ChartBorder.GetRight()) return this.XPointCount;

		return (x-this.ChartBorder.GetLeft())*(this.XPointCount*1.0/this.ChartBorder.GetWidth());
    }
}

function MinuteFrame()
{
    this.newMethod=AverageWidthFrame;   //派生
    this.newMethod();
    delete this.newMethod;

    this.MinuteCount=243;   //每天的分钟个数

    this.DrawFrame=function()
    {
        this.SplitXYCoordinate();

        this.DrawTitleBG();
        this.DrawHorizontal();
        this.DrawVertical();
    }

    //分割x,y轴坐标信息
    this.SplitXYCoordinate=function()
    {
        if (this.XYSplit==false) return;
        if (this.YSplitOperator!=null) this.YSplitOperator.Operator();
        if (this.XSplitOperator!=null) this.XSplitOperator.Operator();
    }

    this.GetXFromIndex=function(index)
    {
        var count=this.XPointCount-1;

        if (count==1)
        {
            if (index==0) return this.ChartBorder.GetLeft();
            else return this.ChartBorder.GetRight();
        }
        else if (count<=0)
        {
            return this.ChartBorder.GetLeft();
        }
        else if (index>=count)
        {
            return this.ChartBorder.GetRight();
        }
        else
        {
            var offset=this.ChartBorder.GetLeft()+this.ChartBorder.GetWidth()*index/count;
            return offset;
        }
    }

     //X坐标转x轴数值
     this.GetXData=function(x)
     {
        var count=this.XPointCount-1;
        if (count<0) count=0;

         if (x<=this.ChartBorder.GetLeft()) return 0;
         if (x>=this.ChartBorder.GetRight()) return count;
 
         return (x-this.ChartBorder.GetLeft())*(count*1.0/this.ChartBorder.GetWidth());
     }
}

//走势图 横屏框架
function MinuteHScreenFrame()
{
    this.newMethod=MinuteFrame;   //派生
    this.newMethod();
    delete this.newMethod;

    this.IsHScreen=true;        //是否是横屏

    //画标题背景色
    this.DrawTitleBG=function()
    {
        if (this.ChartBorder.TitleHeight<=0) return;

        var left=ToFixedPoint(this.ChartBorder.GetRightEx());
        var top=ToFixedPoint(this.ChartBorder.GetTop());
        var bottom=ToFixedPoint(this.ChartBorder.GetBottom());
        var width=this.ChartBorder.TitleHeight;
        var height=bottom-top;

        this.Canvas.fillStyle=this.TitleBGColor;
        this.Canvas.fillRect(left,top,width,height);
    }

    //Y坐标转y轴数值
    this.GetYData=function(x)
    {
        if (x<this.ChartBorder.GetLeft()) return this.HorizontalMin;
		if (x>this.ChartBorder.GetRightEx()) return this.HorizontalMax;

		return (x-this.ChartBorder.GetLeft())/this.ChartBorder.GetWidthEx()*(this.HorizontalMax-this.HorizontalMin)+this.HorizontalMin;
    }

    //X坐标转x轴数值
    this.GetXData=function(y)
    {
        if (y<=this.ChartBorder.GetTop()) return 0;
		if (y>=this.ChartBorder.GetBottom()) return this.XPointCount;

		return (y-this.ChartBorder.GetTop())*(this.XPointCount*1.0/this.ChartBorder.GetHeight());
    }

    this.GetXFromIndex=function(index)
    {
        var count=this.XPointCount-1;

        if (count==1)
        {
            if (index==0) return this.ChartBorder.GetTop();
            else return this.ChartBorder.GetBottom();
        }
        else if (count<=0)
        {
            return this.ChartBorder.GetTop();
        }
        else if (index>=count)
        {
            return this.ChartBorder.GetBottom();
        }
        else
        {
            var offset=this.ChartBorder.GetTop()+this.ChartBorder.GetHeight()*index/count;
            return offset;
        }
    }

    
    this.GetYFromData=function(value)
    {
        if(value<=this.HorizontalMin) return this.ChartBorder.GetLeft();
        if(value>=this.HorizontalMax) return this.ChartBorder.GetRightEx();

        var width=this.ChartBorder.GetWidthEx()*(value-this.HorizontalMin)/(this.HorizontalMax-this.HorizontalMin);
        return this.ChartBorder.GetLeft()+width;
    }

    //画Y轴
    this.DrawHorizontal=function()
    {
        var top=this.ChartBorder.GetTop();
        var bottom=this.ChartBorder.GetBottom();
        var left=this.ChartBorder.GetLeft();
        var right=this.ChartBorder.GetRight();
        var borderTop=this.ChartBorder.Top;
        var borderBottom=this.ChartBorder.Bottom;

        var yPrev=null; //上一个坐标y的值
        for(var i=this.HorizontalInfo.length-1; i>=0; --i)  //从左往右画分割线
        {
            var item=this.HorizontalInfo[i];
            var y=this.GetYFromData(item.Value);
            if (y!=null && Math.abs(y-yPrev)<this.MinYDistance) continue;  //两个坐标在近了 就不画了

            this.Canvas.strokeStyle=item.LineColor;
            this.Canvas.beginPath();
            this.Canvas.moveTo(ToFixedPoint(y),top);
            this.Canvas.lineTo(ToFixedPoint(y),bottom);
            this.Canvas.stroke();

            if (y >= right - 2) 
            {
                this.Canvas.textBaseline = 'top';
                y = right;
            }
            else if (y <= left + 2) 
            {
                this.Canvas.textBaseline = 'bottom';
                y=left;
                if (y != null && Math.abs(y - yPrev) < 2*this.MinYDistance) continue;  //两个坐标在近了 就不画了
            }
            else 
            {
                this.Canvas.textBaseline = "middle";
            }

            //坐标信息 左边 间距小于10 不画坐标
            if (item.Message[0]!=null && borderTop>10)
            {
                if (item.Font!=null) this.Canvas.font=item.Font;

                this.Canvas.fillStyle=item.TextColor;
                this.Canvas.textAlign="right";

                var xText=y,yText=top;
                this.Canvas.save();
                this.Canvas.translate(xText, yText);
                this.Canvas.rotate(90 * Math.PI / 180);
                this.Canvas.fillText(item.Message[0], -2, 0);
                this.Canvas.restore();
            }

            //坐标信息 右边 间距小于10 不画坐标
            if (item.Message[1]!=null && borderBottom>10)
            {
                if (item.Font!=null) this.Canvas.font=item.Font;

                this.Canvas.fillStyle=item.TextColor;
                this.Canvas.textAlign="left";
               
                var xText=y,yText=bottom;
                this.Canvas.save();
                this.Canvas.translate(xText, yText);
                this.Canvas.rotate(90 * Math.PI / 180);
                this.Canvas.fillText(item.Message[1], 2, 0);
                this.Canvas.restore();
            }

            yPrev=y;
        }
    }

    //画X轴
    this.DrawVertical=function()
    {
        var left=this.ChartBorder.GetLeft();
        var right=this.ChartBorder.GetRightEx();
        var bottom=this.ChartBorder.GetBottom();

        var xPrev=null; //上一个坐标x的值
        for(var i in this.VerticalInfo)
        {
            var x=this.GetXFromIndex(this.VerticalInfo[i].Value);
            if (x>bottom) break;
            if (xPrev!=null && Math.abs(x-xPrev)<this.MinXDistance) continue;

            this.Canvas.strokeStyle=this.VerticalInfo[i].LineColor;
            this.Canvas.beginPath();
            this.Canvas.moveTo(left,ToFixedPoint(x));
            this.Canvas.lineTo(right,ToFixedPoint(x));
            this.Canvas.stroke();

            if (this.VerticalInfo[i].Message[0]!=null)
            {
                if (this.VerticalInfo[i].Font!=null)
                    this.Canvas.font=this.VerticalInfo[i].Font;

                this.Canvas.fillStyle=this.VerticalInfo[i].TextColor;
                var testWidth=this.Canvas.measureText(this.VerticalInfo[i].Message[0]).width;
                if (x<testWidth/2)
                {
                    this.Canvas.textAlign="left";
                    this.Canvas.textBaseline="top";
                }
                else if ((x + testWidth / 2) >= this.ChartBorder.GetChartHeight())
                {
                    this.Canvas.textAlign = "right";
                    this.Canvas.textBaseline = "top";
                }
                else
                {
                    this.Canvas.textAlign="center";
                    this.Canvas.textBaseline="top";
                }

                var xText=left,yText=x;
                this.Canvas.save();
                this.Canvas.translate(xText, yText);
                this.Canvas.rotate(90 * Math.PI / 180);
                this.Canvas.fillText(this.VerticalInfo[i].Message[0], 0, 0);
                this.Canvas.restore();
            }

            xPrev=x;
        }
    }
}

//K线框架
function KLineFrame()
{
    this.newMethod=AverageWidthFrame;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ToolbarID=Guid();  //工具条Div id

    this.ModifyIndex=true;  //是否显示'改参数'菜单
    this.ChangeIndex=true;  //是否显示'换指标'菜单
    this.CloseIndex=true;   //是否显示'关闭指标窗口'菜单

    this.ModifyIndexEvent;  //改参数 点击事件
    this.ChangeIndexEvent;   //换指标 点击事件

    this.DrawToolbar=function()
    {
        var divToolbar=document.getElementById(this.ToolbarID);
        if (!divToolbar)
        {
            divToolbar=document.createElement("div");
            divToolbar.className='klineframe-toolbar';
            divToolbar.id=this.ToolbarID;
            //为divToolbar添加属性identify
            divToolbar.setAttribute("identify",this.Identify.toString());
            this.ChartBorder.UIElement.parentNode.appendChild(divToolbar);
        }

        if (!this.ModifyIndex && !this.ChangeIndex)
        {
            divToolbar.style.display='none';
            return;
        }

        var pixelTatio=GetDevicePixelRatio();
        var toolbarWidth=100;
        var toolbarHeight=this.ChartBorder.GetTitleHeight();
        var left=(this.ChartBorder.GetRight()-toolbarWidth)/pixelTatio;
        var top=this.ChartBorder.GetTop()/pixelTatio;
        var spanIcon = "<span class='index_param icon iconfont icon-index_param' id='modifyindex' style='cursor:pointer;' title='调整指标参数'></span>&nbsp;&nbsp;" +
            "<span class='index_change icon iconfont icon-setting' id='changeindex' style='cursor:pointer;' title='选择指标'></span>";

        if (this.Identify!==0 && this.CloseIndex)  //第1个窗口不能关闭
        {
            const spanCloseIcon="&nbsp;&nbsp;<span class='index_close icon iconfont icon-close' id='closeindex' style='cursor:pointer;' title='关闭指标窗口'></span>";
            spanIcon+=spanCloseIcon;
        }

        //var scrollPos=GetScrollPosition();
        //left = left+scrollPos.Left;
        //top = top+scrollPos.Top;
        divToolbar.style.left = left + "px";
        divToolbar.style.top = top + "px";
        divToolbar.style.width=toolbarWidth+"px";
        divToolbar.style.height=toolbarHeight+'px';
        divToolbar.innerHTML=spanIcon;

        var chart=this.ChartBorder.UIElement.JSChartContainer;
        var identify=this.Identify;
        if (!this.ModifyIndex)  //隐藏'改参数'
            $("#"+divToolbar.id+" .index_param").hide();
        else if (typeof(this.ModifyIndexEvent)=='function')  //绑定点击事件
            $("#"+divToolbar.id+" .index_param").click(
                {
                    Chart:this.ChartBorder.UIElement.JSChartContainer,
                    Identify:this.Identify
                },this.ModifyIndexEvent);

        if (!this.ChangeIndex)  //隐藏'换指标'
            $("#"+divToolbar.id+" .index_change").hide();
        else if (typeof(this.ChangeIndexEvent)=='function')
            $("#"+divToolbar.id+" .index_change").click(
                {
                    Chart:this.ChartBorder.UIElement.JSChartContainer,
                    Identify:this.Identify
                },this.ChangeIndexEvent);
        
        $("#"+divToolbar.id+" .index_close").click(
            {
                Chart:this.ChartBorder.UIElement.JSChartContainer,
                Identify:this.Identify
            },
            function(event)
            {
                var hqChart=event.data.Chart;
                var id=event.data.Identify;
                hqChart.RemoveIndexWindow(id);
            });

        divToolbar.style.display = "block";
    }

    this.ClearToolbar=function()
    {
        var divToolbar=document.getElementById(this.ToolbarID);
        if (!divToolbar) return;
        this.ChartBorder.UIElement.parentNode.removeChild(divToolbar);
    }

    this.DrawFrame=function()
    {
        this.SplitXYCoordinate();

        if (this.SizeChange==true) this.CalculateDataWidth();

        this.DrawTitleBG();
        this.DrawHorizontal();
        this.DrawVertical();

        if (this.SizeChange==true) this.DrawToolbar();  //大小变动才画工具条
    }

    //isLimit 是否限制在当前屏坐标下
    this.GetXFromIndex=function(index,isLimit)
    {
        if (isLimit===false)
        {
            if (index>=0)
            {
                var offset=this.ChartBorder.GetLeft()+2+this.DistanceWidth/2+this.DataWidth/2;
                for(var i=1;i<=index;++i)
                {
                    offset+=this.DistanceWidth+this.DataWidth;
                }
            }
            else
            {
                var offset=this.ChartBorder.GetLeft()+2+this.DistanceWidth/2+this.DataWidth/2;
                var absIndex=Math.abs(index);
                for(var i=0;i<absIndex;++i)
                {
                    offset-=(this.DistanceWidth+this.DataWidth);
                }
            }
        }
        else
        {
            if (index < 0) index = 0;
            if (index > this.xPointCount - 1) index = this.xPointCount - 1;

            var offset=this.ChartBorder.GetLeft()+2+this.DistanceWidth/2+this.DataWidth/2;
            for(var i=1;i<=index;++i)
            {
                offset+=this.DistanceWidth+this.DataWidth;
            }
        }

        return offset;
    }

    //计算数据宽度
    this.CalculateDataWidth=function()
    {
        if (this.XPointCount<2) return;

        var width=this.ChartBorder.GetWidth()-4;

        for(var i=0;i<ZOOM_SEED.length;++i)
        {
            if((ZOOM_SEED[i][0] + ZOOM_SEED[i][1]) * this.XPointCount < width)
            {
                this.ZoomIndex=i;
                this.DataWidth = ZOOM_SEED[i][0];
                this.DistanceWidth = ZOOM_SEED[i][1];
                if (i == 0) break;      // 如果是最大的缩放因子，不再调整数据宽度

                this.TrimKLineDataWidth(width);
                return;
            }
        }
    }

    this.TrimKLineDataWidth=function(width)
    {
        while(true)
        {
            if((this.DistanceWidth + this.DataWidth) * this.XPointCount + this.DistanceWidth > width)
            {
                this.DataWidth -= 0.01;
                break;
            }
            this.DataWidth += 0.01;
        }
    }

    //分割x,y轴坐标信息
    this.SplitXYCoordinate=function()
    {
        if (this.XYSplit==false) return;
        if (this.YSplitOperator!=null) this.YSplitOperator.Operator();
        if (this.XSplitOperator!=null) this.XSplitOperator.Operator();
    }

    this.CalculateCount=function(zoomIndex)
    {
        var width=this.ChartBorder.GetWidth();

        return parseInt(width/(ZOOM_SEED[zoomIndex][0] + ZOOM_SEED[zoomIndex][1]));
    }

    this.ZoomUp=function(cursorIndex)
    {
        if (this.ZoomIndex<=0) return false;
        if (this.Data.DataOffset<0) return false;

        var lastDataIndex = this.Data.DataOffset + this.XPointCount - 1;    //最右边的数据索引
        var lastCursorIndex=this.Data.DataOffset + cursorIndex.Index;

        if (lastDataIndex>this.Data.Data.length) lastDataIndex=this.Data.Data.length-1;

        --this.ZoomIndex;
        var xPointCount=this.CalculateCount(this.ZoomIndex);

        this.XPointCount=xPointCount;

        this.DataWidth = ZOOM_SEED[this.ZoomIndex][0];
	    this.DistanceWidth = ZOOM_SEED[this.ZoomIndex][1];

        this.TrimKLineDataWidth(this.ChartBorder.GetWidth());

        if (lastDataIndex>=this.Data.Data.length)
        {
            this.Data.DataOffset=this.Data.Data.length-this.XPointCount-2;
            cursorIndex.Index=this.Data.Data.length-this.Data.DataOffset-1;
        }
        else
        {
            if (lastDataIndex<this.XPointCount)
            {
                this.Data.DataOffset=0;
                cursorIndex.Index=lastCursorIndex;
            }
            else
            {
                this.Data.DataOffset = lastDataIndex - this.XPointCount+1;
                cursorIndex.Index=lastCursorIndex-this.Data.DataOffset;
            }
        }

        return true;
    }

    this.ZoomDown=function(cursorIndex)
    {
        if (this.ZoomIndex+1>=ZOOM_SEED.length) return false;
        if (this.Data.DataOffset<0) return false;

        var lastDataIndex = this.Data.DataOffset + this.XPointCount - 1;    //最右边的数据索引
        if (lastDataIndex>=this.Data.Data.length) lastDataIndex=this.Data.Data.length-1;
        var xPointCount=this.CalculateCount(this.ZoomIndex+1);

        var lastCursorIndex=this.Data.DataOffset + cursorIndex.Index;

        ++this.ZoomIndex;
        this.XPointCount=xPointCount;
        this.DataWidth = ZOOM_SEED[this.ZoomIndex][0];
	    this.DistanceWidth = ZOOM_SEED[this.ZoomIndex][1];

        this.TrimKLineDataWidth(this.ChartBorder.GetWidth());

        if (lastDataIndex-xPointCount+1<0)
            this.Data.DataOffset=0;
        else
            this.Data.DataOffset = lastDataIndex - this.XPointCount+1;

        cursorIndex.Index=lastCursorIndex-this.Data.DataOffset;

        return true;
    }
}

//K线横屏框架
function KLineHScreenFrame()
{
    this.newMethod=KLineFrame;   //派生
    this.newMethod();
    delete this.newMethod;

    this.IsHScreen=true;        //是否是横屏

    //画标题背景色
    this.DrawTitleBG=function()
    {
        if (this.ChartBorder.TitleHeight<=0) return;

        var left=ToFixedPoint(this.ChartBorder.GetRightTitle());
        var top=ToFixedPoint(this.ChartBorder.GetTop());
        var bottom=ToFixedPoint(this.ChartBorder.GetBottom());
        var width=this.ChartBorder.TitleHeight;
        var height=bottom-top;

        this.Canvas.fillStyle=this.TitleBGColor;
        this.Canvas.fillRect(left,top,width,height);
    }

    this.DrawToolbar=function()
    {
        return;
    }

    this.GetYFromData=function(value)
    {
        if(value<=this.HorizontalMin) return this.ChartBorder.GetLeftEx();
        if(value>=this.HorizontalMax) return this.ChartBorder.GetRightEx();

        var width=this.ChartBorder.GetWidthEx()*(value-this.HorizontalMin)/(this.HorizontalMax-this.HorizontalMin);
        return this.ChartBorder.GetLeftEx()+width;
    }

    //画Y轴
    this.DrawHorizontal=function()
    {
        var top=this.ChartBorder.GetTop();
        var bottom=this.ChartBorder.GetBottom();
        var borderTop=this.ChartBorder.Top;
        var borderBottom=this.ChartBorder.Bottom;

        var yPrev=null; //上一个坐标y的值
        for(var i=this.HorizontalInfo.length-1; i>=0; --i)  //从左往右画分割线
        {
            var item=this.HorizontalInfo[i];
            var y=this.GetYFromData(item.Value);
            if (y!=null && Math.abs(y-yPrev)<15) continue;  //两个坐标在近了 就不画了

            this.Canvas.strokeStyle=item.LineColor;
            this.Canvas.beginPath();
            this.Canvas.moveTo(ToFixedPoint(y),top);
            this.Canvas.lineTo(ToFixedPoint(y),bottom);
            this.Canvas.stroke();

            //坐标信息 左边 间距小于10 不画坐标
            if (item.Message[0]!=null && borderTop>10)
            {
                if (item.Font!=null) this.Canvas.font=item.Font;

                this.Canvas.fillStyle=item.TextColor;
                this.Canvas.textAlign="right";
                this.Canvas.textBaseline="middle";

                var xText=y,yText=top;
                this.Canvas.save();
                this.Canvas.translate(xText, yText);
                this.Canvas.rotate(90 * Math.PI / 180);
                this.Canvas.fillText(item.Message[0], -2, 0);
                this.Canvas.restore();
            }

            //坐标信息 右边 间距小于10 不画坐标
            if (item.Message[1]!=null && borderBottom>10)
            {
                if (item.Font!=null) this.Canvas.font=item.Font;

                this.Canvas.fillStyle=item.TextColor;
                this.Canvas.textAlign="left";
                this.Canvas.textBaseline="middle";
                var xText=y,yText=bottom;
                this.Canvas.save();
                this.Canvas.translate(xText, yText);
                this.Canvas.rotate(90 * Math.PI / 180);
                this.Canvas.fillText(item.Message[1], 2, 0);
                this.Canvas.restore();
            }

            yPrev=y;
        }
    }

    this.GetXFromIndex=function(index)
    {
        if (index < 0) index = 0;
	    if (index > this.xPointCount - 1) index = this.xPointCount - 1;

        var offset=this.ChartBorder.GetTop()+2+this.DistanceWidth/2+this.DataWidth/2;
        for(var i=1;i<=index;++i)
        {
            offset+=this.DistanceWidth+this.DataWidth;
        }

        return offset;
    }

    //画X轴
    this.DrawVertical=function()
    {
        var left=this.ChartBorder.GetLeft();
        var right=this.ChartBorder.GetRightTitle();
        var bottom=this.ChartBorder.GetBottom();

        var xPrev=null; //上一个坐标x的值
        for(var i in this.VerticalInfo)
        {
            var x=this.GetXFromIndex(this.VerticalInfo[i].Value);
            if (x>=bottom) break;
            if (xPrev!=null && Math.abs(x-xPrev)<80) continue;

            this.Canvas.strokeStyle=this.VerticalInfo[i].LineColor;
            this.Canvas.beginPath();
            this.Canvas.moveTo(left,ToFixedPoint(x));
            this.Canvas.lineTo(right,ToFixedPoint(x));
            this.Canvas.stroke();

            if (this.VerticalInfo[i].Message[0]!=null)
            {
                if (this.VerticalInfo[i].Font!=null)
                    this.Canvas.font=this.VerticalInfo[i].Font;

                this.Canvas.fillStyle=this.VerticalInfo[i].TextColor;
                var testWidth=this.Canvas.measureText(this.VerticalInfo[i].Message[0]).width;
                if (x<testWidth/2)
                {
                    this.Canvas.textAlign="left";
                    this.Canvas.textBaseline="top";
                }
                else
                {
                    this.Canvas.textAlign="center";
                    this.Canvas.textBaseline="top";
                }

                var xText=left,yText=x;
                this.Canvas.save();
                this.Canvas.translate(xText, yText);
                this.Canvas.rotate(90 * Math.PI / 180);
                this.Canvas.fillText(this.VerticalInfo[i].Message[0], 0, 0);
                this.Canvas.restore();
            }

            xPrev=x;
        }
    }

    //Y坐标转y轴数值
    this.GetYData=function(x)
    {
        if (x<this.ChartBorder.GetLeftEx()) return this.HorizontalMin;
		if (x>this.ChartBorder.GetRightEx()) return this.HorizontalMax;

		return (x-this.ChartBorder.GetLeftEx())/this.ChartBorder.GetWidthEx()*(this.HorizontalMax-this.HorizontalMin)+this.HorizontalMin;
    }

    //X坐标转x轴数值
    this.GetXData=function(y)
    {
        if (y<=this.ChartBorder.GetTop()) return 0;
		if (y>=this.ChartBorder.GetBottom()) return this.XPointCount;

		return (y-this.ChartBorder.GetTop())*(this.XPointCount*1.0/this.ChartBorder.GetHeight());
    }

    //计算数据宽度
    this.CalculateDataWidth=function()
    {
        if (this.XPointCount<2) return;

        var width=this.ChartBorder.GetHeight()-4;

        for(var i=0;i<ZOOM_SEED.length;++i)
        {
            if((ZOOM_SEED[i][0] + ZOOM_SEED[i][1]) * this.XPointCount < width)
            {
                this.ZoomIndex=i;
                this.DataWidth = ZOOM_SEED[i][0];
                this.DistanceWidth = ZOOM_SEED[i][1];
                if (i == 0) break;      // 如果是最大的缩放因子，不再调整数据宽度

                this.TrimKLineDataWidth(width);
                return;
            }
        }
    }

    this.CalculateCount=function(zoomIndex) //计算当天的缩放比例下 一屏显示的数据个数
    {
        var width=this.ChartBorder.GetHeight();
        return parseInt(width/(ZOOM_SEED[zoomIndex][0] + ZOOM_SEED[zoomIndex][1]));
    }

    this.ZoomUp=function(cursorIndex)
    {
        if (this.ZoomIndex<=0) return false;
        if (this.Data.DataOffset<0) return false;

        var lastDataIndex = this.Data.DataOffset + this.XPointCount - 1;    //最右边的数据索引
        var lastCursorIndex=this.Data.DataOffset + cursorIndex.Index;

        if (lastDataIndex>this.Data.Data.length) lastDataIndex=this.Data.Data.length-1;

        --this.ZoomIndex;
        var xPointCount=this.CalculateCount(this.ZoomIndex);

        this.XPointCount=xPointCount;

        this.DataWidth = ZOOM_SEED[this.ZoomIndex][0];
	    this.DistanceWidth = ZOOM_SEED[this.ZoomIndex][1];

        this.TrimKLineDataWidth(this.ChartBorder.GetHeight());

        if (lastDataIndex>=this.Data.Data.length)
        {
            this.Data.DataOffset=this.Data.Data.length-this.XPointCount-2;
            cursorIndex.Index=this.Data.Data.length-this.Data.DataOffset-1;
        }
        else
        {
            if (lastDataIndex<this.XPointCount)
            {
                this.Data.DataOffset=0;
                cursorIndex.Index=lastCursorIndex;
            }
            else
            {
                this.Data.DataOffset = lastDataIndex - this.XPointCount+1;
                cursorIndex.Index=lastCursorIndex-this.Data.DataOffset;
            }
        }

        return true;
    }

    this.ZoomDown=function(cursorIndex)
    {
        if (this.ZoomIndex+1>=ZOOM_SEED.length) return false;
        if (this.Data.DataOffset<0) return false;

        var lastDataIndex = this.Data.DataOffset + this.XPointCount - 1;    //最右边的数据索引
        if (lastDataIndex>=this.Data.Data.length) lastDataIndex=this.Data.Data.length-1;
        var xPointCount=this.CalculateCount(this.ZoomIndex+1);

        var lastCursorIndex=this.Data.DataOffset + cursorIndex.Index;

        ++this.ZoomIndex;
        this.XPointCount=xPointCount;
        this.DataWidth = ZOOM_SEED[this.ZoomIndex][0];
	    this.DistanceWidth = ZOOM_SEED[this.ZoomIndex][1];

        this.TrimKLineDataWidth(this.ChartBorder.GetHeight());

        if (lastDataIndex-xPointCount+1<0)
            this.Data.DataOffset=0;
        else
            this.Data.DataOffset = lastDataIndex - this.XPointCount+1;

        cursorIndex.Index=lastCursorIndex-this.Data.DataOffset;

        return true;
    }
}

function SubFrameItem()
{
    this.Frame;
    this.Height;
}

//行情框架
function HQTradeFrame()
{
    this.SubFrame=new Array();              //SubFrameItem 数组
    this.SizeChange=true;                   //大小是否改变
    this.ChartBorder;
    this.Canvas;                            //画布
    this.ScreenImageData;                   //截图
    this.Data;                              //主数据
    this.Position;                          //画布的位置
    this.SizeChange=true;

    this.CalculateChartBorder=function()    //计算每个子框架的边框信息
    {
        if (this.SubFrame.length<=0) return;

        var top=this.ChartBorder.GetTop();
        var height=this.ChartBorder.GetHeight();
        var totalHeight=0;

        for(var i in this.SubFrame)
        {
            var item=this.SubFrame[i];
            totalHeight+=item.Height;
        }

        for(var i in this.SubFrame)
        {
            var item=this.SubFrame[i];
            item.Frame.ChartBorder.Top=top;
            item.Frame.ChartBorder.Left=this.ChartBorder.Left;
            item.Frame.ChartBorder.Right=this.ChartBorder.Right;
            var frameHeight=height*(item.Height/totalHeight)+top;
            item.Frame.ChartBorder.Bottom=this.ChartBorder.GetChartHeight()-frameHeight;
            top=frameHeight;
        }
    }

    this.Draw=function()
    {
        if (this.SizeChange===true) this.CalculateChartBorder();

        for(var i in this.SubFrame)
        {
            var item=this.SubFrame[i];
            item.Frame.Draw();
        }

        this.SizeChange=false;
    }
    this.DrawLock=function()
    {
        for (var i in this.SubFrame)
        {
            var item = this.SubFrame[i];
            item.Frame.DrawLock();
        }
    }

    this.DrawInsideHorizontal = function () 
    {
        for (var i in this.SubFrame) 
        {
          var item = this.SubFrame[i];
          if (item.Frame.DrawInsideHorizontal) item.Frame.DrawInsideHorizontal();
        }
      }

    this.SetSizeChage=function(sizeChange)
    {
        this.SizeChange=sizeChange;

        for(var i in this.SubFrame)
        {
            var item=this.SubFrame[i];
            item.Frame.SizeChange=sizeChange;
        }

        //画布的位置
        this.Position={
            X:this.ChartBorder.UIElement.offsetLeft,
            Y:this.ChartBorder.UIElement.offsetTop,
            W:this.ChartBorder.UIElement.clientWidth,
            H:this.ChartBorder.UIElement.clientHeight
        };
    }

    //图形快照
    this.Snapshot=function()
    {
        this.ScreenImageData=this.Canvas.getImageData(0,0,this.ChartBorder.GetChartWidth(),this.ChartBorder.GetChartHeight());
    }

    this.GetXData=function(x)
    {
        return this.SubFrame[0].Frame.GetXData(x);
    }

    this.GetYData=function(y,outObject) //outObject 可以保存返回的额外数据
    {
        var frame;
        for(var i in this.SubFrame)
        {
            var item=this.SubFrame[i];
            var left=item.Frame.ChartBorder.GetLeft();
            var top=item.Frame.ChartBorder.GetTopEx();
            var width=item.Frame.ChartBorder.GetWidth();
            var height=item.Frame.ChartBorder.GetHeightEx();

            item.Frame.Canvas.beginPath();
            item.Frame.Canvas.rect(left,top,width,height);
            if (item.Frame.Canvas.isPointInPath(left,y))
            {
                frame=item.Frame;
                if (outObject) outObject.FrameID=parseInt(i);   //转成整形
                break;
            }
        }

        if (frame!=null) return frame.GetYData(y);
    }

    this.PtInFrame=function(x,y)    //鼠标哪个指标窗口
    {
        for(var i in this.SubFrame)
        {
            var item=this.SubFrame[i];
            var left=item.Frame.ChartBorder.GetLeft();
            var top=item.Frame.ChartBorder.GetTop();
            var width=item.Frame.ChartBorder.GetWidth();
            var height=item.Frame.ChartBorder.GetHeight();

            item.Frame.Canvas.beginPath();
            item.Frame.Canvas.rect(left,top,width,height);
            if (item.Frame.Canvas.isPointInPath(x,y))
            {
                return parseInt(i);   //转成整形
            }
        }

        return -1;
    }

    this.GetXFromIndex=function(index)
    {
        return this.SubFrame[0].Frame.GetXFromIndex(index);
    }

    this.GetYFromData=function(value)
    {
        return this.SubFrame[0].Frame.GetYFromData(value);
    }

    this.ZoomUp=function(cursorIndex)
    {
        var result=this.SubFrame[0].Frame.ZoomUp(cursorIndex);
        for(var i=1;i<this.SubFrame.length;++i)
        {
            this.SubFrame[i].Frame.XPointCount= this.SubFrame[0].Frame.XPointCount;
            this.SubFrame[i].Frame.ZoomIndex= this.SubFrame[0].Frame.ZoomIndex;
            this.SubFrame[i].Frame.DataWidth= this.SubFrame[0].Frame.DataWidth;
            this.SubFrame[i].Frame.DistanceWidth= this.SubFrame[0].Frame.DistanceWidth;
        }

        return result;
    }

    this.ZoomDown=function(cursorIndex)
    {
        var result=this.SubFrame[0].Frame.ZoomDown(cursorIndex);
        for(var i=1;i<this.SubFrame.length;++i)
        {
            this.SubFrame[i].Frame.XPointCount= this.SubFrame[0].Frame.XPointCount;
            this.SubFrame[i].Frame.ZoomIndex= this.SubFrame[0].Frame.ZoomIndex;
            this.SubFrame[i].Frame.DataWidth= this.SubFrame[0].Frame.DataWidth;
            this.SubFrame[i].Frame.DistanceWidth= this.SubFrame[0].Frame.DistanceWidth;
        }

        return result;
    }

    //设置重新计算刻度坐标
    this.ResetXYSplit=function()
    {
        for(let i in this.SubFrame)
        {
            this.SubFrame[i].Frame.XYSplit=true;
        }
    }
}

//行情框架横屏
function HQTradeHScreenFrame()
{
    this.newMethod=HQTradeFrame;   //派生
    this.newMethod();
    delete this.newMethod;

    this.IsHScreen=true;        //是否是横屏

    this.CalculateChartBorder=function()    //计算每个子框架的边框信息
    {
        if (this.SubFrame.length<=0) return;

        var right=this.ChartBorder.Right;
        var left=this.ChartBorder.GetRight();
        var width=this.ChartBorder.GetWidth();
        var totalHeight=0;

        for(var i in this.SubFrame)
        {
            var item=this.SubFrame[i];
            totalHeight+=item.Height;
        }

        for(var i in this.SubFrame)
        {
            var item=this.SubFrame[i];
            item.Frame.ChartBorder.Top=this.ChartBorder.Top;
            item.Frame.ChartBorder.Bottom=this.ChartBorder.Bottom;

            var frameWidth=width*(item.Height/totalHeight);
            item.Frame.ChartBorder.Right=right;
            item.Frame.ChartBorder.Left=left-frameWidth;
            
            right+=frameWidth;
            left-=frameWidth;
        }
    }

    this.GetYData=function(x,outObject)
    {
        var frame;
        for(var i in this.SubFrame)
        {
            var item=this.SubFrame[i];
            var left=item.Frame.ChartBorder.GetLeftEx();
            var top=item.Frame.ChartBorder.GetTop();
            var width=item.Frame.ChartBorder.GetWidthEx();
            var height=item.Frame.ChartBorder.GetHeight();

            item.Frame.Canvas.beginPath();
            item.Frame.Canvas.rect(left,top,width,height);
            if (item.Frame.Canvas.isPointInPath(x,top))
            {
                frame=item.Frame;
                if (outObject) outObject.FrameID=i;
                break;
            }
        }

        if (frame!=null) return frame.GetYData(x);
    }
}


function SimpleChartFrame()
{
    this.newMethod=AverageWidthFrame;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ScreenImageData;                   //截图
    this.Position;                          //画布的位置

    this.DrawFrame=function()
    {
        if (this.XPointCount>0)
        {
            let dInterval=this.ChartBorder.GetWidth()/(6*this.XPointCount); //分6份, 数据4 间距2
            this.DistanceWidth=2*dInterval;
			this.DataWidth=4*dInterval;
        }

        this.SplitXYCoordinate();
        this.DrawHorizontal();
        this.DrawVertical();
    }

    this.GetXFromIndex=function(index)
    {
        if (index < 0) index = 0;
	    if (index > this.xPointCount - 1) index = this.xPointCount - 1;

        var offset=this.ChartBorder.GetLeft()+2+this.DistanceWidth/2+this.DataWidth/2;
        for(var i=1;i<=index;++i)
        {
            offset+=this.DistanceWidth+this.DataWidth;
        }

        return offset;
    }

    //分割x,y轴坐标信息
    this.SplitXYCoordinate=function()
    {
        if (this.XYSplit==false) return;
        if (this.YSplitOperator!=null) this.YSplitOperator.Operator();
        if (this.XSplitOperator!=null) this.XSplitOperator.Operator();
    }

    //图形快照
    this.Snapshot=function()
    {
        this.ScreenImageData=this.Canvas.getImageData(0,0,this.ChartBorder.GetChartWidth(),this.ChartBorder.GetChartHeight());
    }

    this.SetSizeChage=function(sizeChange)
    {
        this.SizeChange=sizeChange;

        //画布的位置
        this.Position={
            X:this.ChartBorder.UIElement.offsetLeft,
            Y:this.ChartBorder.UIElement.offsetTop,
            W:this.ChartBorder.UIElement.clientWidth,
            H:this.ChartBorder.UIElement.clientHeight
        };
    }
}


//历史K线数据
function HistoryData()
{
    this.Date;
    this.YClose;
    this.Open;
    this.Close;
    this.High;
    this.Low;
    this.Vol;
    this.Amount;
    this.Time;
    this.FlowCapital=0;   //流通股本

    //指数才有的数据
    this.Stop;  //停牌家数
    this.Up;    //上涨
    this.Down;  //下跌
    this.Unchanged; //平盘
}

//数据复制
HistoryData.Copy=function(data)
{
    var newData=new HistoryData();
    newData.Date=data.Date;
    newData.YClose=data.YClose;
    newData.Open=data.Open;
    newData.Close=data.Close;
    newData.High=data.High;
    newData.Low=data.Low;
    newData.Vol=data.Vol;
    newData.Amount=data.Amount;
    newData.Time=data.Time;
    newData.FlowCapital=data.FlowCapital;

    newData.Stop=data.Stop;
    newData.Up=data.Up;
    newData.Down=data.Down;
    newData.Unchanged=data.Unchanged;

    return newData;
}

//数据复权拷贝
HistoryData.CopyRight=function(data,seed)
{
    var newData=new HistoryData();
    newData.Date=data.Date;
    newData.YClose=data.YClose*seed;
    newData.Open=data.Open*seed;
    newData.Close=data.Close*seed;
    newData.High=data.High*seed;
    newData.Low=data.Low*seed;

    newData.Vol=data.Vol;
    newData.Amount=data.Amount;
    newData.FlowCapital=data.FlowCapital;

    return newData;
}

function MinuteData()
{
    this.Close;
    this.Open;
    this.High;
    this.Low;
    this.Vol;
    this.Amount;
    this.DateTime;
    this.Increase;
    this.Risefall;
    this.AvPrice;
}

//单指标数据
function SingleData()
{
    this.Date;  //日期
    this.Value; //数据  (可以是一个数组)
}

var KLINE_INFO_TYPE=
{
    INVESTOR:1,         //互动易
    ANNOUNCEMENT:2,     //公告
    PFORECAST:3,        //业绩预告

    ANNOUNCEMENT_QUARTER_1:4,   //一季度报
    ANNOUNCEMENT_QUARTER_2:5,   //半年报
    ANNOUNCEMENT_QUARTER_3:6,   //2季度报
    ANNOUNCEMENT_QUARTER_4:7,   //年报

    RESEARCH:8,                 //调研
    BLOCKTRADING:9,             //大宗交易
    TRADEDETAIL:10              //龙虎榜


}

function KLineInfoData()
{
    this.ID;
    this.Date;
    this.Title;
    this.InfoType;
    this.ExtendData;    //扩展数据
}

function ChartData()
{
    this.Data=new Array();
    this.DataOffset=0;                        //数据偏移
    this.Period=0;                            //周期 0 日线 1 周线 2 月线 3年线
    this.Right=0;                             //复权 0 不复权 1 前复权 2 后复权

    this.Data2=new Array();                   //第1组数据 走势图:历史分钟数据

    this.GetCloseMA=function(dayCount)
    {
        var result=new Array();
        for (var i = 0, len = this.Data.length; i < len; i++)
        {
            if (i < dayCount)
            {
                result[i]=null;
                continue;
            }

            var sum = 0;
            for (var j = 0; j < dayCount; j++)
            {
                sum += this.Data[i - j].Close;
            }
            result[i]=sum / dayCount;
        }
        return result;
    }

    this.GetVolMA=function(dayCount)
    {
    var result=new Array();
    for (var i = 0, len = this.Data.length; i < len; i++)
    {
        if (i < dayCount)
        {
            result[i]=null;
            continue;
        }

        var sum = 0;
        for (var j = 0; j < dayCount; j++)
        {
            sum += this.Data[i - j].Vol;
        }
        result[i]=sum / dayCount;
    }
    return result;
    }

    this.GetAmountMA=function(dayCount)
    {
    var result=new Array();
    for (var i = 0, len = this.Data.length; i < len; i++)
    {
        if (i < dayCount)
        {
            result[i]=null;
            continue;
        }

        var sum = 0;
        for (var j = 0; j < dayCount; j++)
        {
            sum += this.Data[i - j].Amount;
        }
        result[i]=sum / dayCount;
    }
    return result;
    }

    //获取收盘价
    this.GetClose=function()
    {
        var result=new Array();
        for(var i in this.Data)
        {
            result[i]=this.Data[i].Close;
        }

        return result;
    }

    this.GetYClose=function()
    {
        var result=new Array();
        for(var i in this.Data)
        {
            result[i]=this.Data[i].YClose;
        }

        return result;
    }

    this.GetHigh=function()
    {
        var result=new Array();
        for(var i in this.Data)
        {
            result[i]=this.Data[i].High;
        }

        return result;
    }

    this.GetLow=function()
    {
        var result=new Array();
        for(var i in this.Data)
        {
            result[i]=this.Data[i].Low;
        }

        return result;
    }

    this.GetOpen=function()
    {
        var result=new Array();
        for(var i in this.Data)
        {
            result[i]=this.Data[i].Open;
        }

        return result;
    }

    this.GetVol=function()
    {
        var result=new Array();
        for(var i in this.Data)
        {
            result[i]=this.Data[i].Vol;
        }

        return result;
    }

    this.GetAmount=function()
    {
        var result=new Array();
        for(var i in this.Data)
        {
            result[i]=this.Data[i].Amount;
        }

        return result;
    }

    this.GetUp=function()   //上涨家数
    {
        var result=[];
        for(var i in this.Data)
        {
            result[i]=this.Data[i].Up;
        }

        return result;
    }

    this.GetDown=function() //下跌家数
    {
        var result=[];
        for(var i in this.Data)
        {
            result[i]=this.Data[i].Down;
        }

        return result;
    }

    this.GetYear=function()
    {
        var result=new Array();
        for(var i in this.Data)
        {
            result[i]=parseInt(this.Data[i].Date/10000);
        }

        return result;
    }

    this.GetMonth=function()
    {
        var result=new Array();
        for(var i in this.Data)
        {
            result[i]=parseInt(this.Data[i].Date%10000/100);
        }

        return result;
    }

    //计算分钟
    this.GetMinutePeriodData=function(period)
    {
        var result = new Array();
        var periodDataCount = 5;
        if (period == 5)
            periodDataCount = 5;
        else if (period == 6)
            periodDataCount = 15;
        else if (period == 7)
            periodDataCount = 30;
        else if (period == 8)
            periodDataCount = 60;
        else
            return this.Data;
        var bFirstPeriodData = false;
        var newData = null;
        for (var i = 0; i < this.Data.length; )
        {
            bFirstPeriodData = true;
            for (var j = 0; j < periodDataCount && i < this.Data.length; ++i)
            {
                if (bFirstPeriodData)
                {
                    newData = new HistoryData();
                    result.push(newData);
                    bFirstPeriodData = false;
                }
                var minData = this.Data[i];
                if (minData == null)
                {
                    ++j;
                    continue;    
                } 
                if (minData.Time == 925 || minData.Time == 930 || minData.Time == 1300)
                    ;
                else
                    ++j;
                newData.Date = minData.Date;
                newData.Time = minData.Time;
                if (minData.Open==null || minData.Close==null)
                    continue;
                if (newData.Open==null || newData.Close==null)
                {
                    newData.Open=minData.Open;
                    newData.High=minData.High;
                    newData.Low=minData.Low;
                    newData.YClose=minData.YClose;
                    newData.Close=minData.Close;
                    newData.Vol=minData.Vol;
                    newData.Amount=minData.Amount;    
                    newData.FlowCapital=minData.FlowCapital;  
                }
                else
                {
                    if (newData.High<minData.High) 
                        newData.High=minData.High;
                    if (newData.Low>minData.Low) 
                        newData.Low=minData.Low;
                    newData.Close=minData.Close;
                    newData.Vol+=minData.Vol;
                    newData.Amount+=minData.Amount;
                    newData.FlowCapital+=minData.FlowCapital;  
                }
            }
        }
        return result;
    }

    //计算周,月,年
    this.GetDayPeriodData=function(period)
    {
        var result=new Array();
        var index=0;
        var startDate=0;
        var newData=null;
        for(var i in this.Data)
        {
            var isNewData=false;
            var dayData=this.Data[i];

            switch(period)
            {
                case 1: //周线
                    var fridayDate=ChartData.GetFirday(dayData.Date);
                    if (fridayDate!=startDate)
                    {
                        isNewData=true;
                        startDate=fridayDate;
                    }
                    break;
                case 2: //月线
                    if (parseInt(dayData.Date/100)!=parseInt(startDate/100))
                    {
                        isNewData=true;
                        startDate=dayData.Date;
                    }
                    break;
                case 3: //年线
                    if (parseInt(dayData.Date/10000)!=parseInt(startDate/10000))
                    {
                        isNewData=true;
                        startDate=dayData.Date;
                    }
                    break;
            }

            if (isNewData)
            {
                newData=new HistoryData();
                newData.Date=dayData.Date;
                result.push(newData);

                if (dayData.Open==null || dayData.Close==null) continue;

                newData.Open=dayData.Open;
                newData.High=dayData.High;
                newData.Low=dayData.Low;
                newData.YClose=dayData.YClose;
                newData.Close=dayData.Close;
                newData.Vol=dayData.Vol;
                newData.Amount=dayData.Amount;
                newData.FlowCapital=dayData.FlowCapital;
            }
            else
            {
                if (newData==null) continue;
                if (dayData.Open==null || dayData.Close==null) continue;

                if (newData.Open==null || newData.Close==null)
                {
                    newData.Open=dayData.Open;
                    newData.High=dayData.High;
                    newData.Low=dayData.Low;
                    newData.YClose=dayData.YClose;
                    newData.Close=dayData.Close;
                    newData.Vol=dayData.Vol;
                    newData.Amount=dayData.Amount;
                    newData.FlowCapital=dayData.FlowCapital;
                }
                else
                {
                    if (newData.High<dayData.High) newData.High=dayData.High;
                    if (newData.Low>dayData.Low) newData.Low=dayData.Low;

                    newData.Close=dayData.Close;
                    newData.Vol+=dayData.Vol;
                    newData.Amount+=dayData.Amount;
                    newData.FlowCapital+=dayData.FlowCapital;
                    newData.Date=dayData.Date;
                }
            }
        }

        return result;
    }

    //周期数据 1=周 2=月 3=年
    this.GetPeriodData=function(period)
    {
        if (period==1 || period==2 || period==3) return this.GetDayPeriodData(period);
        if (period==5 || period==6 || period==7 || period==8) return this.GetMinutePeriodData(period);
    }

    //复权  0 不复权 1 前复权 2 后复权
    this.GetRightDate=function(right)
    {
        var result=[];
        if (this.Data.length<=0) return result;

        if (right==1)
        {
            var index=this.Data.length-1;
            var seed=1; //复权系数
            var yClose=this.Data[index].YClose;

            result[index]=HistoryData.Copy(this.Data[index]);

            for(--index; index>=0; --index)
            {
                if (yClose!=this.Data[index].Close) break;
                result[index]=HistoryData.Copy(this.Data[index]);
                yClose=this.Data[index].YClose;
            }

            for(; index>=0; --index)
            {
                if(yClose!=this.Data[index].Close)
                    seed *= yClose/this.Data[index].Close;

                result[index]=HistoryData.CopyRight(this.Data[index],seed);

                yClose=this.Data[index].YClose;
            }
        }
        else if (right==2)
        {
            var index=0;
            var seed=1;
            var close=this.Data[index].Close;
            result[index]=HistoryData.Copy(this.Data[index]);

            for(++index;index<this.Data.length;++index)
            {
                if (close!=this.Data[index].YClose) break;
                result[index]=HistoryData.Copy(this.Data[index]);
                close=this.Data[index].Close;
            }

            for(;index<this.Data.length;++index)
            {
                if(close!=this.Data[index].YClose)
                    seed *= close/this.Data[index].YClose;

                result[index]=HistoryData.CopyRight(this.Data[index],seed);

                close=this.Data[index].Close;
            }
        }

        return result;
    }

    //叠加数据和主数据拟合,去掉主数据没有日期的数据
    this.GetOverlayData=function(overlayData)
    {
        var result=[];

        for(var i=0,j=0;i<this.Data.length;)
        {
            var date=this.Data[i].Date;

            if (j>=overlayData.length)
            {
                result[i]=new HistoryData();
                result[i].Date=date;
                ++i;
                continue;;
            }

            var overlayDate=overlayData[j].Date;

            if (overlayDate==date)
            {
                result[i]=new HistoryData();
                result[i].Date=overlayData[j].Date;
                result[i].YClose=overlayData[j].YClose;
                result[i].Open=overlayData[j].Open;
                result[i].High=overlayData[j].High;
                result[i].Low=overlayData[j].Low;
                result[i].Close=overlayData[j].Close;
                result[i].Vol=overlayData[j].Vol;
                result[i].Amount=overlayData[j].Amount;

                //涨跌家数数据
                result[i].Stop=overlayData[j].Stop;
                result[i].Up=overlayData[j].Up;
                result[i].Down=overlayData[j].Down;
                result[i].Unchanged=overlayData[j].Unchanged;

                ++j;
                ++i;
            }
            else if (overlayDate<date)
            {
                ++j;
            }
            else
            {
                result[i]=new HistoryData();
                result[i].Date=date;
                ++i;
            }
        }

        return result;
    }


    /*
        技术指标数据方法
    */
    //以主图数据 拟合,返回 SingleData 数组
    this.GetFittingData=function(overlayData)
    {
        var result=new Array();

        for(var i=0,j=0;i<this.Data.length;)
        {
            var date=this.Data[i].Date;

            if (j>=overlayData.length)
            {
                result[i]=null;
                ++i;
                continue;;
            }

            var overlayDate=overlayData[j].Date;

            if (overlayDate==date)
            {
                var item=new SingleData();
                item.Date=overlayData[j].Date;
                item.Value=overlayData[j].Value;
                result[i]=item;
                ++j;
                ++i;
            }
            else if (overlayDate<date)
            {
                ++j;
            }
            else
            {
                result[i]=new SingleData();
                result[i].Date=date;
                ++i;
            }
        }

        return result;
    }

    // 缺省数据使用 emptyValue填充
    this.GetFittingData2=function(overlayData,emptyValue)
    {
        var result=new Array();

        for(var i=0,j=0;i<this.Data.length;)
        {
            var date=this.Data[i].Date;

            if (j>=overlayData.length)
            {
                result[i]=new SingleData();
                result[i].Date=date;
                result[i].Value=emptyValue;
                ++i;
                continue;;
            }

            var overlayDate=overlayData[j].Date;

            if (overlayDate==date)
            {
                var item=new SingleData();
                item.Date=overlayData[j].Date;
                item.Value=overlayData[j].Value;
                result[i]=item;
                ++j;
                ++i;
            }
            else if (overlayDate<date)
            {
                ++j;
            }
            else
            {
                result[i]=new SingleData();
                result[i].Date=date;
                result[i].Value=emptyValue;
                ++i;
            }
        }

        return result;
    }


    //把财报数据拟合到主图数据,返回 SingleData 数组
    this.GetFittingFinanceData=function(financeData)
    {
        var result=[];

        for(var i=0,j=0;i<this.Data.length;)
        {
            var date=this.Data[i].Date;

            if (j+1<financeData.length)
            {
                if (financeData[j].Date<date && financeData[j+1].Date<=date)
                {
                    ++j;
                    continue;
                }
            }

            var item=new SingleData();
            item.Date=date;
            if (j<financeData.length)
            {
                item.Value=financeData[j].Value;
                item.FinanceDate=financeData[j].Date;   //财务日期 调试用
            }
            else
            {
                item.Value=null;
                item.FinanceDate=null;
            }
            result[i]=item;

            ++i;
        }

        return result;
    }

    //财务数据拟合到分钟数据上 返回 SingleData 数组
    this.GetMinuteFittingFinanceData=function(financeData)
    {
        var result=[];
        for(var i=0,j=0;i<this.Data.length;)
        {
            var date=this.Data[i].Date;
            var time=this.Data[i].Time;

            if (j+1<financeData.length)
            {
                if (financeData[j].Date<date && financeData[j+1].Date<=date)
                {
                    ++j;
                    continue;
                }
            }

            var item=new SingleData();
            item.Date=date;
            item.Time=time;
            if (j<financeData.length)
            {
                item.Value=financeData[j].Value;
                item.FinanceDate=financeData[j].Date;   //财务日期 调试用
            }
            else
            {
                item.Value=null;
                item.FinanceDate=null;
            }
            result[i]=item;

            ++i;
        }

        return result;
    }

    //市值计算 financeData.Value 是股数
    this.GetFittingMarketValueData=function(financeData)
    {
        var result=[];

        for(var i=0,j=0;i<this.Data.length;)
        {
            var date=this.Data[i].Date;
            var price=this.Data[i].Close;

            if (j+1<financeData.length)
            {
                if (financeData[j].Date<date && financeData[j+1].Date<=date)
                {
                    ++j;
                    continue;
                }
            }

            var item=new SingleData();
            item.Date=date;
            item.Value=financeData[j].Value*price;  //市值计算 收盘价*股数
            item.FinanceDate=financeData[j].Date;   //财务日期 调试用
            result[i]=item;

            ++i;
        }

        return result;
    }

    //月线数据拟合
    this.GetFittingMonthData=function(overlayData)
    {
        var result=new Array();

        var preDate=null;
        for(var i=0,j=0;i<this.Data.length;)
        {
            var date=this.Data[i].Date;

            if (j>=overlayData.length)
            {
                result[i]=null;
                ++i;
                continue;;
            }

            var overlayDate=overlayData[j].Date;

            if (overlayDate==date)
            {
                var item=new SingleData();
                item.Date=overlayData[j].Date;
                item.Value=overlayData[j].Value;
                item.Text=overlayData[j].Text;
                result[i]=item;
                ++j;
                ++i;
            }
            else if (preDate!=null && preDate<overlayDate && date>overlayDate)
            {
                var item=new SingleData();
                item.Date=date;
                item.OverlayDate=overlayData[j].Date;
                item.Value=overlayData[j].Value;
                item.Text=overlayData[j].Text;
                result[i]=item;
                ++j;
                ++i;
            }
            else if (overlayDate<date)
            {
                ++j;
            }
            else
            {
                result[i]=new SingleData();
                result[i].Date=date;
                ++i;
            }

            preDate=date;
        }

        return result;
    }

    this.GetValue=function()
    {
        var result=new Array();
        for(var i in this.Data)
        {
            if (this.Data[i] && this.Data[i].Value!=null)
            { 
                if (!isNaN(this.Data[i].Value))
                    result[i]=this.Data[i].Value;
                else if (this.Data[i].Value instanceof Array)   //支持数组
                    result[i]=this.Data[i].Value;
                else
                    result[i]=null;
            }
            else
                result[i]=null;
        }

        return result;
    }

    this.GetPeriodSingleData=function(period)
    {
        var result=new Array();
        var index=0;
        var startDate=0;
        var newData=null;
        for(var i in this.Data)
        {
            var isNewData=false;
            var dayData=this.Data[i];
            if (dayData==null || dayData.Date==null) continue;

            switch(period)
            {
                case 1: //周线
                    var fridayDate=ChartData.GetFirday(dayData.Date);
                    if (fridayDate!=startDate)
                    {
                        isNewData=true;
                        startDate=fridayDate;
                    }
                    break;
                case 2: //月线
                    if (parseInt(dayData.Date/100)!=parseInt(startDate/100))
                    {
                        isNewData=true;
                        startDate=dayData.Date;
                    }
                    break;
                case 3: //年线
                    if (parseInt(dayData.Date/10000)!=parseInt(startDate/10000))
                    {
                        isNewData=true;
                        startDate=dayData.Date;
                    }
                    break;
            }

            if (isNewData)
            {
                newData=new SingleData();
                newData.Date=dayData.Date;
                newData.Value=dayData.Value;
                result.push(newData);
            }
            else
            {
                if (newData==null) continue;
                if (dayData.Value==null || isNaN(dayData.Value)) continue;
                if (newData.Value==null || isNaN(newData.Value)) newData.Value=dayData.Value;
            }
        }

        return result;
    }

    /*
        分钟数据方法
        this.GetClose()     每分钟价格
        this.GetVol()       每分钟成交量
    */

    //分钟均线
    this.GetMinuteAvPrice=function()
    {
        var result=new Array();
        for(var i in this.Data)
        {
            result[i]=this.Data[i].AvPrice;
        }

        return result;
    }
}

ChartData.GetFirday=function(value)
{
    var date=new Date(parseInt(value/10000),(value/100%100-1),value%100);
    var day=date.getDay();
    if (day==5) return value;

    var timestamp=date.getTime();
    if (day<5)
    {
        var prevTimestamp=(24*60*60*1000)*(5-day);
        timestamp+=prevTimestamp;
    }
    else
    {
        var prevTimestamp=(24*60*60*1000)*(day-5);
        timestamp-=prevTimestamp;
    }

    date.setTime(timestamp);
    var fridayDate= date.getFullYear()*10000+(date.getMonth()+1)*100+date.getDate();
    var week=date.getDay();
    return fridayDate;

}

function TooltipData()              //提示信息
{
    this.ChartPaint;
    this.Data;
    this.Type=0;
}

function Rect(x,y,width,height)
{
    this.X=x,
    this.Y=y;
    this.Width=width;
    this.Height=height;
}

//图新画法接口类
function IChartPainting()
{
    this.Canvas;                        //画布
    this.ChartBorder;                   //边框信息
    this.ChartFrame;                    //框架画法
    this.Name;                          //名称
    this.ClassName='IChartPainting';    //类名
    this.Data=new ChartData();          //数据区

    this.NotSupportMessage=null;
    this.MessageFont=g_JSChartResource.Index.NotSupport.Font;
    this.MessageColor=g_JSChartResource.Index.NotSupport.TextColor;
    this.IsDrawFirst=false;
    this.IsShow=true;

    this.Draw=function()
    {

    }

    this.DrawNotSupportmessage=function()
    {
        this.Canvas.font=this.MessageFont;
        this.Canvas.fillStyle=this.MessageColor;

        var left=this.ChartBorder.GetLeft();
        var width=this.ChartBorder.GetWidth();
        var top=this.ChartBorder.GetTopEx();
        var height=this.ChartBorder.GetHeightEx();

        var x=left+width/2;
        var y=top+height/2;

        this.Canvas.textAlign="center";
        this.Canvas.textBaseline="middle";
        this.Canvas.fillText(this.NotSupportMessage,x,y);
    }

    this.GetTooltipData=function(x,y,tooltip)
    {
        return false;
    }

    this.GetMaxMin=function()
    {
        var xPointCount=this.ChartFrame.XPointCount;
        var range={};
        range.Min=null;
        range.Max=null;

        if(!this.Data || !this.Data.Data) return range;

        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (value==null || isNaN(value)) continue;

            if (range.Max==null) range.Max=value;
            if (range.Min==null) range.Min=value;

            if (range.Max<value) range.Max=value;
            if (range.Min>value) range.Min=value;
        }

        return range;
    }

    this.GetDynamicFont=function(dataWidth) //根据宽度自动获取对应字体
    {
        var pixelTatio = GetDevicePixelRatio();
        var font;   
        if (dataWidth < 5) font =4*pixelTatio + 'px Arial';           //字体根据数据宽度动态调整
        else if (dataWidth < 7) font = 6*pixelTatio +'px Arial';
        else if (dataWidth < 9) font = 8*pixelTatio +'px Arial';
        else if (dataWidth < 11) font =10*pixelTatio +'px Arial';
        else if (dataWidth < 13) font =12*pixelTatio +'px Arial';
        else if (dataWidth < 15) font =14*pixelTatio + 'px Arial';
        else font =16*pixelTatio + 'px Arial';
        
        return font;
    }
}


//缩放因子
/*
var ZOOM_SEED=
[
    [49,10],	[46,9],		[43,8],
    [41,7.5],	[39,7],		[37,6],
    [31,5.5],	[27,5],		[23,4.5],
    [21,4],		[18,3.5],	[16,3],
    [13,2.5],	[11,2],		[8,1.5],
    [6,1],		[3,0.6],	[2.2,0.5],
    //太多了卡,
    //[1.1,0.3],
    //[0.9,0.2],	[0.7,0.15],
    //[0.6,0.12],	[0.5,0.1],	[0.4,0.08],
    //[0.3,0.06],	[0.2,0.04],	[0.1,0.02]
];
*/

var ZOOM_SEED=
[
    [48,10],	[44,10], 
    [40,9],     [36,9],	
    [32,8],     [28,8],	
    [24,7],     [20,7], 
    [18,6],     [16,6],
    [14,5],     [12,5],
    [8,4],      [3,3],
    [3,1],   
];

//K线画法 支持横屏
function ChartKLine()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Symbol;        //股票代码
    this.DrawType=0;    // 0=实心K线柱子  1=收盘价线 2=美国线 3=空心K线柱子
    this.CloseLineColor=g_JSChartResource.CloseLineColor;
    this.UpColor=g_JSChartResource.UpBarColor;
    this.DownColor=g_JSChartResource.DownBarColor;
    this.UnchagneColor=g_JSChartResource.UnchagneBarColor;          //平盘
    this.ColorData;             //五彩K线颜色 >0：g_JSChartResource.UpBarColor 其他：g_JSChartResource.DownBarColor
    this.TradeData;             //交易系统 包含买卖数据{Buy:, Sell:}
    this.TradeIcon=g_JSChartResource.KLine.TradeIcon;
    this.TooltipRect=new Array();           //2位数组 0 数据序号 1 区域
    this.InfoTooltipRect=[];                //2维数组 0 数据,  1 区域

    this.IsShowMaxMinPrice=true;                 //是否显示最大最小值
    this.IsShowKTooltip=true;                    //是否显示K线tooltip
    this.TextFont=g_JSChartResource.KLine.MaxMin.Font;
    this.TextColor=g_JSChartResource.KLine.MaxMin.Color;

    this.InfoData;      //信息地雷 key=日期  value=信息数据

    this.PtMax;     //最大值的位置
    this.PtMin;     //最小值的位置

    this.DrawAKLine=function()  //美国线
    {
        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var xOffset=this.ChartBorder.GetLeft()+distanceWidth/2.0+2.0;
        if (isHScreen) xOffset=this.ChartBorder.GetTop()+distanceWidth/2.0+2.0;
        var chartright=this.ChartBorder.GetRight();
        if (isHScreen) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;

        var upColor=this.UpColor;
        var downColor=this.DownColor;
        var unchagneColor=this.UnchagneColor; 

        var ptMax={X:null,Y:null,Value:null,Align:'left'};
        var ptMin={X:null,Y:null,Value:null,Align:'left'};
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
        {
            var data=this.Data.Data[i];
            if (data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;

            var left=xOffset;
            var right=xOffset+dataWidth;
            if (right>chartright) break;
            var x=left+(right-left)/2;
            var yLow=this.ChartFrame.GetYFromData(data.Low);
            var yHigh=this.ChartFrame.GetYFromData(data.High);
            var yOpen=this.ChartFrame.GetYFromData(data.Open);
            var yClose=this.ChartFrame.GetYFromData(data.Close);

            if (ptMax.Value==null || ptMax.Value<data.High)     //求最大值
            {
                ptMax.X=x;
                ptMax.Y=yHigh;
                ptMax.Value=data.High;
                ptMax.Align=j<xPointCount/2?'left':'right';
            }

            if (ptMin.Value==null || ptMin.Value>data.Low)      //求最小值
            {
                ptMin.X=x;
                ptMin.Y=yLow;
                ptMin.Value=data.Low;
                ptMin.Align=j<xPointCount/2?'left':'right';
            }

            if (data.Open<data.Close) this.Canvas.strokeStyle=this.UpColor; //阳线
            else if (data.Open>data.Close) this.Canvas.strokeStyle=this.DownColor; //阳线
            else this.Canvas.strokeStyle=this.UnchagneColor; //平线

            if (this.ColorData) ///五彩K线颜色设置
            {
                if (i<this.ColorData.length)
                    upColor=downColor=unchagneColor=(this.ColorData[i]>0?this.UpColor:this.DownColor);
                else
                    upColor=downColor=unchagneColor=this.DownColor;
            }

            this.Canvas.beginPath();   //最高-最低
            if (isHScreen)
            {
                this.Canvas.moveTo(yHigh,ToFixedPoint(x));
                this.Canvas.lineTo(yLow,ToFixedPoint(x));
            }
            else
            {
                this.Canvas.moveTo(ToFixedPoint(x),yHigh);
                this.Canvas.lineTo(ToFixedPoint(x),yLow);
            }
            
            this.Canvas.stroke();

            if (dataWidth>=4)
            {
                this.Canvas.beginPath();    //开盘
                if (isHScreen)
                {
                    this.Canvas.moveTo(ToFixedPoint(yOpen),left);
                    this.Canvas.lineTo(ToFixedPoint(yOpen),x);
                }
                else
                {
                    this.Canvas.moveTo(left,ToFixedPoint(yOpen));
                    this.Canvas.lineTo(x,ToFixedPoint(yOpen));
                }
                this.Canvas.stroke();

                this.Canvas.beginPath();    //收盘
                if (isHScreen)
                {
                    this.Canvas.moveTo(ToFixedPoint(yClose),right);
                    this.Canvas.lineTo(ToFixedPoint(yClose),x);
                }
                else
                {
                    this.Canvas.moveTo(right,ToFixedPoint(yClose));
                    this.Canvas.lineTo(x,ToFixedPoint(yClose));
                }
                this.Canvas.stroke();
            }

            if(this.Data.DataType==0)
            {
                var infoItem={Xleft:left,XRight:right, YMax:yHigh, XCenter:x, YMin:yLow, DayData:data, Index:j};
                this.DrawInfo(infoItem);
            }
        }

        this.PtMax=ptMax;
        this.PtMin=ptMin;
    }

    this.DrawCloseLine=function()   //收盘价线
    {
        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var xOffset=this.ChartBorder.GetLeft()+distanceWidth/2.0+2.0;
        if (isHScreen) xOffset=this.ChartBorder.GetTop()+distanceWidth/2.0+2.0;
        var chartright=this.ChartBorder.GetRight();
        if (isHScreen) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;

        var bFirstPoint=true;
        this.Canvas.beginPath();
        this.Canvas.strokeStyle=this.CloseLineColor;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
        {
            var data=this.Data.Data[i];
            if (data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;

            var left=xOffset;
            var right=xOffset+dataWidth;
            if (right>chartright) break;
            var x=left+(right-left)/2;
            var yClose=this.ChartFrame.GetYFromData(data.Close);

            if (bFirstPoint)
            {
                if (isHScreen) this.Canvas.moveTo(yClose,x);
                else this.Canvas.moveTo(x,yClose);
                bFirstPoint=false;
            }
            else
            {
                if (isHScreen) this.Canvas.lineTo(yClose,x);
                else this.Canvas.lineTo(x,yClose);
            }
        }

        if (bFirstPoint==false) this.Canvas.stroke();
    }

    this.DrawKBar=function()        //蜡烛头
    {
        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var xOffset=this.ChartBorder.GetLeft()+distanceWidth/2.0+2.0;
        var chartright=this.ChartBorder.GetRight();
        var xPointCount=this.ChartFrame.XPointCount;

        if (isHScreen) 
        {
            xOffset=this.ChartBorder.GetTop()+distanceWidth/2.0+2.0;
            chartright=this.ChartBorder.GetBottom();
        }

        var ptMax={X:null,Y:null,Value:null,Align:'left'};
        var ptMin={X:null,Y:null,Value:null,Align:'left'};
        
        var upColor=this.UpColor;
        var downColor=this.DownColor;
        var unchagneColor=this.UnchagneColor; 

        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
        {
            var data=this.Data.Data[i];
            if (data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;

            var left=xOffset;
            var right=xOffset+dataWidth;
            if (right>chartright) break;
            var x=left+(right-left)/2;
            var yLow=this.ChartFrame.GetYFromData(data.Low);
            var yHigh=this.ChartFrame.GetYFromData(data.High);
            var yOpen=this.ChartFrame.GetYFromData(data.Open);
            var yClose=this.ChartFrame.GetYFromData(data.Close);
            var y=yHigh;

            if (ptMax.Value==null || ptMax.Value<data.High)     //求最大值
            {
                ptMax.X=x;
                ptMax.Y=yHigh;
                ptMax.Value=data.High;
                ptMax.Align=j<xPointCount/2?'left':'right';
            }

            if (ptMin.Value==null || ptMin.Value>data.Low)      //求最小值
            {
                ptMin.X=x;
                ptMin.Y=yLow;
                ptMin.Value=data.Low;
                ptMin.Align=j<xPointCount/2?'left':'right';
            }

            if (this.ColorData) ///五彩K线颜色设置
            {
                if (i<this.ColorData.length)
                    upColor=downColor=unchagneColor=(this.ColorData[i]>0?this.UpColor:this.DownColor);
                else
                    upColor=downColor=unchagneColor=this.DownColor;
            }

            if (data.Open<data.Close)       //阳线
            {
                if (dataWidth>=4)
                {
                    this.Canvas.strokeStyle=upColor;
                    if (data.High>data.Close)   //上影线
                    {
                        this.Canvas.beginPath();
                        if (isHScreen)
                        {
                            this.Canvas.moveTo(ToFixedPoint(y),ToFixedPoint(x));
                            this.Canvas.lineTo(ToFixedPoint(this.DrawType==3?Math.max(yClose,yOpen):yClose),ToFixedPoint(x));
                        }
                        else
                        {
                            this.Canvas.moveTo(ToFixedPoint(x),ToFixedPoint(y));
                            this.Canvas.lineTo(ToFixedPoint(x),ToFixedPoint(this.DrawType==3?Math.min(yClose,yOpen):yClose));
                        }
                        this.Canvas.stroke();
                        y=yClose;
                    }
                    else
                    {
                        y=yClose;
                    }

                    this.Canvas.fillStyle=upColor;
                    if (isHScreen)
                    {
                        if (Math.abs(yOpen-y)<1)  
                        {
                            this.Canvas.fillRect(ToFixedRect(y),ToFixedRect(left),1,ToFixedRect(dataWidth));    //高度小于1,统一使用高度1
                        }
                        else 
                        {
                            if (this.DrawType==3) //空心柱
                            {
                                this.Canvas.beginPath();
                                this.Canvas.rect(ToFixedPoint(y),ToFixedPoint(left),ToFixedRect(yOpen-y),ToFixedRect(dataWidth));
                                this.Canvas.stroke();
                            }
                            else
                            {
                                this.Canvas.fillRect(ToFixedRect(y),ToFixedRect(left),ToFixedRect(yOpen-y),ToFixedRect(dataWidth));
                            }
                        }
                    }
                    else
                    {
                        if (Math.abs(yOpen-y)<1)  
                        {
                            this.Canvas.fillRect(ToFixedRect(left),ToFixedRect(y),ToFixedRect(dataWidth),1);    //高度小于1,统一使用高度1
                        }
                        else 
                        {
                            if (this.DrawType==3) //空心柱
                            {
                                this.Canvas.beginPath();
                                this.Canvas.rect(ToFixedPoint(left),ToFixedPoint(y),ToFixedRect(dataWidth),ToFixedRect(yOpen-y));
                                this.Canvas.stroke();
                            }
                            else
                            {
                                this.Canvas.fillRect(ToFixedRect(left),ToFixedRect(Math.min(y,yOpen)),ToFixedRect(dataWidth),ToFixedRect(Math.abs(yOpen-y)));
                            }
                        }
                    }

                    if (data.Open>data.Low) //下影线
                    {
                        this.Canvas.beginPath();
                        if (isHScreen)
                        {
                            this.Canvas.moveTo(ToFixedPoint(this.DrawType==3?Math.min(yClose,yOpen):y),ToFixedPoint(x));
                            this.Canvas.lineTo(ToFixedPoint(yLow),ToFixedPoint(x));
                        }
                        else
                        {
                            this.Canvas.moveTo(ToFixedPoint(x),ToFixedPoint(this.DrawType==3?Math.max(yClose,yOpen):y));
                            this.Canvas.lineTo(ToFixedPoint(x),ToFixedPoint(yLow));
                        }
                        this.Canvas.stroke();
                    }
                }
                else
                {
                    this.Canvas.beginPath();
                    if (isHScreen)
                    {
                        this.Canvas.moveTo(yHigh,ToFixedPoint(x),);
                        this.Canvas.lineTo(yLow,ToFixedPoint(x));
                    }
                    else
                    {
                        this.Canvas.moveTo(ToFixedPoint(x),yHigh);
                        this.Canvas.lineTo(ToFixedPoint(x),yLow);
                    }
                    this.Canvas.strokeStyle=upColor;
                    this.Canvas.stroke();
                }
            }
            else if (data.Open>data.Close)  //阴线
            {
                if (dataWidth>=4)
                {
                    this.Canvas.strokeStyle=downColor;
                    if (data.High>data.Close)   //上影线
                    {
                        this.Canvas.beginPath();
                        if (isHScreen)
                        {
                            this.Canvas.moveTo(ToFixedPoint(y),ToFixedPoint(x));
                            this.Canvas.lineTo(ToFixedPoint(yOpen),ToFixedPoint(x));
                        }
                        else
                        {
                            this.Canvas.moveTo(ToFixedPoint(x),ToFixedPoint(y));
                            this.Canvas.lineTo(ToFixedPoint(x),ToFixedPoint(yOpen));
                        }
                        this.Canvas.stroke();
                        y=yOpen;
                    }
                    else
                    {
                        y=yOpen
                    }

                    this.Canvas.fillStyle=downColor;
                    if (isHScreen)
                    {
                        if (Math.abs(yClose-y)<1) this.Canvas.fillRect(ToFixedRect(y),ToFixedRect(left),1,ToFixedRect(dataWidth));    //高度小于1,统一使用高度1
                        else this.Canvas.fillRect(ToFixedRect(y),ToFixedRect(left),ToFixedRect(yClose-y),ToFixedRect(dataWidth));
                    }
                    else
                    {
                        if (Math.abs(yClose-y)<1) this.Canvas.fillRect(ToFixedRect(left),ToFixedRect(y),ToFixedRect(dataWidth),1);    //高度小于1,统一使用高度1
                        else this.Canvas.fillRect(ToFixedRect(left),ToFixedRect(Math.min(y,yClose)),ToFixedRect(dataWidth),ToFixedRect(Math.abs(yClose-y)));
                    }

                    if (data.Open>data.Low) //下影线
                    {
                        this.Canvas.beginPath();
                        if (isHScreen)
                        {
                            this.Canvas.moveTo(ToFixedPoint(y),ToFixedPoint(x));
                            this.Canvas.lineTo(ToFixedPoint(yLow),ToFixedPoint(x));
                        }
                        else
                        {
                            this.Canvas.moveTo(ToFixedPoint(x),ToFixedPoint(y));
                            this.Canvas.lineTo(ToFixedPoint(x),ToFixedPoint(yLow));
                        }
                        this.Canvas.stroke();
                    }
                }
                else
                {
                    this.Canvas.beginPath();
                    if (isHScreen)
                    {
                        this.Canvas.moveTo(yHigh,ToFixedPoint(x));
                        this.Canvas.lineTo(yLow,ToFixedPoint(x));
                    }
                    else
                    {
                        this.Canvas.moveTo(ToFixedPoint(x),yHigh);
                        this.Canvas.lineTo(ToFixedPoint(x),yLow);
                    }
                    this.Canvas.strokeStyle=downColor;
                    this.Canvas.stroke();
                }
            }
            else // 平线
            {
                if (dataWidth>=4)
                {
                    this.Canvas.strokeStyle=unchagneColor;
                    this.Canvas.beginPath();
                    if (data.High>data.Close)   //上影线
                    {
                        if (isHScreen)
                        {
                            this.Canvas.moveTo(y,ToFixedPoint(x));
                            this.Canvas.lineTo(yOpen,ToFixedPoint(x));
                        }
                        else
                        {
                            this.Canvas.moveTo(ToFixedPoint(x),y);
                            this.Canvas.lineTo(ToFixedPoint(x),yOpen);
                        }
                        y=yOpen;
                    }
                    else
                    {
                        y=yOpen;
                    }

                    if (isHScreen)
                    {
                        this.Canvas.moveTo(ToFixedPoint(y),ToFixedPoint(left));
                        this.Canvas.lineTo(ToFixedPoint(y),ToFixedPoint(right));
                    }
                    else
                    {
                        this.Canvas.moveTo(ToFixedPoint(left),ToFixedPoint(y));
                        this.Canvas.lineTo(ToFixedPoint(right),ToFixedPoint(y));
                    }

                    if (data.Open>data.Low) //下影线
                    {
                        if (isHScreen)
                        {
                            this.Canvas.moveTo(ToFixedPoint(y),ToFixedPoint(x));
                            this.Canvas.lineTo(ToFixedPoint(yLow),ToFixedPoint(x));
                        }
                        else
                        {
                            this.Canvas.moveTo(ToFixedPoint(x),ToFixedPoint(y));
                            this.Canvas.lineTo(ToFixedPoint(x),ToFixedPoint(yLow));
                        }
                    }

                    this.Canvas.stroke();
                }
                else
                {
                    this.Canvas.beginPath();
                    if (isHScreen)
                    {
                        this.Canvas.moveTo(yHigh,ToFixedPoint(x));
                        this.Canvas.lineTo(yLow,ToFixedPoint(x));
                    }
                    else
                    {
                        this.Canvas.moveTo(ToFixedPoint(x),yHigh);
                        this.Canvas.lineTo(ToFixedPoint(x),yLow);
                    }
                    this.Canvas.strokeStyle=unchagneColor;
                    this.Canvas.stroke();
                }
            }
            
            if (this.IsShowKTooltip && !isHScreen)    //添加tooltip区域
            {
                var yTop=Math.min(yOpen,yClose);
                var yBottom=Math.max(yOpen,yClose);
                if (Math.abs(yOpen-yClose)<5)   //高度太小了, 上下各+5px
                {
                    yTop=Math.max(yHigh,yTop-5);
                    yBottom=Math.min(yLow,yBottom+5);
                }
                var rect=new Rect(left,yTop,dataWidth,yBottom-yTop);
                //this.Canvas.fillStyle="rgb(0,0,100)";
                //this.Canvas.fillRect(rect.X,rect.Y,rect.Width,rect.Height);
                this.TooltipRect.push([i,rect]);    //[0]数据索引 [1]数据区域
            }

            if(this.Data.DataType==0)
            {
                var infoItem={Xleft:left,XRight:right, XCenter:x, YMax:yHigh, YMin:yLow, DayData:data, Index:j};
                this.DrawInfo(infoItem);
            }
        }

        this.PtMax=ptMax;
        this.PtMin=ptMin;
    }

    this.DrawTrade=function()       //交易系统
    {
        if (!this.TradeData) return;

        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var xOffset=this.ChartBorder.GetLeft()+distanceWidth/2.0+2.0;
        var chartright=this.ChartBorder.GetRight();
        var xPointCount=this.ChartFrame.XPointCount;

        if (isHScreen) 
        {
            xOffset=this.ChartBorder.GetTop()+distanceWidth/2.0+2.0;
            chartright=this.ChartBorder.GetBottom();
        }

        var sellData=this.TradeData.Sell;
        var buyData=this.TradeData.Buy;
        var arrowWidth=dataWidth;
        if (arrowWidth>10) arrowWidth=10;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
        {
            var data=this.Data.Data[i];
            if (data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;

            var buy=false,sell=false;
            if (sellData && i<sellData.length) sell=sellData[i]>0;
            if (buyData && i<buyData.length) buy=buyData[i]>0;
            if (!sell && !buy) continue;

            var left=xOffset;
            var right=xOffset+dataWidth;
            if (right>chartright) break;
            var x=left+(right-left)/2;
            var yLow=this.ChartFrame.GetYFromData(data.Low);
            var yHigh=this.ChartFrame.GetYFromData(data.High);
            var yOpen=this.ChartFrame.GetYFromData(data.Open);
            var yClose=this.ChartFrame.GetYFromData(data.Close);
            var y=yHigh;

            if (buy)
            {
                this.Canvas.fillStyle=this.UpColor;
                this.Canvas.strokeStyle=this.UnchagneColor;
                this.Canvas.beginPath();
                if (isHScreen)
                {
                    this.Canvas.moveTo(yLow-1,x);
                    this.Canvas.lineTo(yLow-arrowWidth-1,x-arrowWidth/2);
                    this.Canvas.lineTo(yLow-arrowWidth-1,x+arrowWidth/2,);
                }
                else
                {
                    this.Canvas.moveTo(x,yLow+1);
                    this.Canvas.lineTo(x-arrowWidth/2,yLow+arrowWidth+1);
                    this.Canvas.lineTo(x+arrowWidth/2,yLow+arrowWidth+1);
                }
                this.Canvas.closePath();
                this.Canvas.fill();
                this.Canvas.stroke();
            }

            if (sell)
            {
                this.Canvas.fillStyle=this.DownColor;
                this.Canvas.strokeStyle=this.UnchagneColor;
                this.Canvas.beginPath();
                if (isHScreen)
                {
                    this.Canvas.moveTo(yHigh+1,x);
                    this.Canvas.lineTo(yHigh+arrowWidth+1,x-arrowWidth/2);
                    this.Canvas.lineTo(yHigh+arrowWidth+1,x+arrowWidth/2);
                }
                else
                {
                    this.Canvas.moveTo(x,yHigh-1);
                    this.Canvas.lineTo(x-arrowWidth/2,yHigh-arrowWidth-1);
                    this.Canvas.lineTo(x+arrowWidth/2,yHigh-arrowWidth-1);
                }
                this.Canvas.closePath();
                this.Canvas.fill();
                this.Canvas.stroke();
            }
        }
    }

    this.Draw=function()
    {
        this.TooltipRect=[];
        this.InfoTooltipRect=[];
        this.PtMax={X:null,Y:null,Value:null,Align:'left'}; //清空最大
        this.PtMin={X:null,Y:null,Value:null,Align:'left'}; //清空最小

        if (!this.IsShow) return;

        if (this.DrawType==1) 
        {
            this.DrawCloseLine();
            return;
        }
        else if (this.DrawType==2)
        {
            this.DrawAKLine();
        }
        else
        {
            this.DrawKBar();
        }

        if (this.TradeIcon) this.DrawTradeIcon()
        else this.DrawTrade();

        if (this.IsShowMaxMinPrice)     //标注最大值最小值
        {
            if (this.ChartFrame.IsHScreen===true) this.HScreenDrawMaxMinPrice(this.PtMax,this.PtMin);
            else this.DrawMaxMinPrice(this.PtMax,this.PtMin);
        }
    }

    this.DrawMaxMinPrice=function(ptMax,ptMin)
    {
        if (ptMax.X==null || ptMax.Y==null || ptMax.Value==null) return;
        if (ptMin.X==null || ptMin.Y==null || ptMin.Value==null) return;

        var defaultfloatPrecision=GetfloatPrecision(this.Symbol);
        this.Canvas.font=this.TextFont;
        this.Canvas.fillStyle=this.TextColor;

        var ptTop=ptMax;
        if (ptMax.Y>ptMin.Y) ptTop=ptMin;
        this.Canvas.textAlign=ptTop.Align;
        this.Canvas.textBaseline='bottom';
        var left=ptTop.Align=='left'?ptTop.X:ptTop.X;
        this.Canvas.fillText(ptTop.Value.toFixed(defaultfloatPrecision),left,ptTop.Y);

        /*
        this.Canvas.beginPath();
        this.Canvas.moveTo(ptMax.X,ptMax.Y);
        this.Canvas.lineTo(left,ptMax.Y+8);
        this.Canvas.strokeStyle=this.TextColor;
        this.Canvas.stroke();
        this.Canvas.closePath();
        */

        var ptBottom=ptMin;
        if (ptMin.Y<ptMax.Y) ptBottom=ptMax;
        this.Canvas.textAlign=ptBottom.Align;
        this.Canvas.textBaseline='top';
        var left=ptBottom.Align=='left'?ptBottom.X:ptBottom.X;
        this.Canvas.fillText(ptMin.Value.toFixed(defaultfloatPrecision),left,ptBottom.Y);

        /*
        this.Canvas.beginPath();
        this.Canvas.moveTo(ptMin.X,ptMin.Y);
        this.Canvas.lineTo(left,ptMin.Y-8);
        this.Canvas.strokeStyle=this.TextColor;
        this.Canvas.stroke();
        this.Canvas.closePath();
        */
    }

    this.HScreenDrawMaxMinPrice=function(ptMax,ptMin)   //横屏模式下显示最大最小值
    {
        if (ptMax.X==null || ptMax.Y==null || ptMax.Value==null) return;
        if (ptMin.X==null || ptMin.Y==null || ptMin.Value==null) return;

        var defaultfloatPrecision=GetfloatPrecision(this.Symbol);
        var xText=ptMax.Y;
        var yText=ptMax.X;
        this.Canvas.save(); 
        this.Canvas.translate(xText, yText);
        this.Canvas.rotate(90 * Math.PI / 180);

        this.Canvas.font=this.TextFont;
        this.Canvas.fillStyle=this.TextColor;
        this.Canvas.textAlign=ptMax.Align;
        this.Canvas.textBaseline='bottom';
        this.Canvas.fillText(ptMax.Value.toFixed(defaultfloatPrecision),0,0);

        this.Canvas.restore();
        /*
        this.Canvas.beginPath();
        this.Canvas.moveTo(ptMax.Y,ptMax.X);
        this.Canvas.lineTo(ptMax.Y-8,ptMax.X+left);
        this.Canvas.strokeStyle=this.TextColor;
        this.Canvas.stroke();
        this.Canvas.closePath();
        */

        
        var xText=ptMin.Y;
        var yText=ptMin.X;
        this.Canvas.save(); 
        this.Canvas.translate(xText, yText);
        this.Canvas.rotate(90 * Math.PI / 180);

        this.Canvas.font=this.TextFont;
        this.Canvas.fillStyle=this.TextColor;
        this.Canvas.textAlign=ptMin.Align;
        this.Canvas.textBaseline='top';
        this.Canvas.fillText(ptMin.Value.toFixed(defaultfloatPrecision),0,0);
        this.Canvas.restore();

        /*
        this.Canvas.beginPath();
        this.Canvas.moveTo(ptMin.Y,ptMin.X,);
        this.Canvas.lineTo(ptMin.Y+8,ptMin.X+left);
        this.Canvas.strokeStyle=this.TextColor;
        this.Canvas.stroke();
        this.Canvas.closePath();
        */
    }

    //画某一天的信息地雷
    this.DrawInfo=function(item)
    {
        if (!this.InfoData || this.InfoData.length<=0) return;

        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;

        var infoData=this.InfoData.get(item.DayData.Date.toString());
        if (!infoData || infoData.Data.length<=0) return;

        var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
        var iconSize=dataWidth+distanceWidth;
        var minIconSize=18*pixelTatio;
        if (iconSize<minIconSize) iconSize=minIconSize;
        
        var text='', title='';
        var mapImage=new Map();
        var iconTop=item.YMax+1*pixelTatio;
        for(var i in infoData.Data)
        {
            var infoItem=infoData.Data[i];
            var imageInfo=mapImage.get(infoItem.InfoType);
            if (!imageInfo)
            {
                var icon=JSKLineInfoMap.GetIconFont(infoItem.InfoType);
                this.Canvas.fillStyle=icon.Color;
                this.Canvas.font=iconSize+'px '+icon.Family;

                if (isHScreen)
                {
                    this.Canvas.textBaseline="middle";
                    this.Canvas.textAlign="left";
                    this.Canvas.fillText(icon.HScreenText,iconTop,item.XCenter,iconSize);

                    var iconRect=new Rect(item.XCenter-iconSize/2,iconTop-iconSize,iconSize,iconSize);
                    infoCache={ Data:new Array(infoItem), Rect:iconRect, Type:infoItem.InfoType, TextRect:{X:iconTop, Y:item.XCenter} };
                    mapImage.set(infoItem.InfoType,infoCache);

                    iconTop+=iconSize;
                }
                else
                {
                    this.Canvas.textBaseline="bottom";
                    this.Canvas.textAlign="center";
                    this.Canvas.fillText(icon.Text,item.XCenter,iconTop,iconSize);
                
                    var iconRect=new Rect(item.XCenter-iconSize/2,iconTop-iconSize,iconSize,iconSize);
                    var infoCache={ Data:new Array(infoItem), Rect:iconRect, Type:infoItem.InfoType, TextRect:{X:item.XCenter, Y:iconTop} };
                    mapImage.set(infoItem.InfoType,infoCache);

                    iconTop-=iconSize;
                }
            }
            else
            {
                imageInfo.Data.push(infoItem);
            }
        }

        var numText;
        if (g_JSChartResource.KLine.NumIcon) 
        {
            if (isHScreen) numText=g_JSChartResource.KLine.NumIcon.HScreenText;
            else numText=g_JSChartResource.KLine.NumIcon.Text;
        }
        for(var item of mapImage)
        {
            var value=item[1];
            if (value.Data.length>=2 && numText)
            {
                var iconID=value.Data.length;
                if (iconID>=numText.length) iconID=0;
                this.Canvas.fillStyle=g_JSChartResource.KLine.NumIcon.Color;
                var text=numText[iconID];
                this.Canvas.fillText(text,value.TextRect.X,value.TextRect.Y,iconSize);
            }

            if (!isHScreen) this.InfoTooltipRect.push(value);   //横屏没有tooltip
        }
    }

    //画交易图标
    this.DrawTradeIcon=function()
    {
        if (!this.TradeData) return;

        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var xOffset=this.ChartBorder.GetLeft()+distanceWidth/2.0+2.0;
        var chartright=this.ChartBorder.GetRight();
        var xPointCount=this.ChartFrame.XPointCount;

        if (isHScreen) 
        {
            xOffset=this.ChartBorder.GetTop()+distanceWidth/2.0+2.0;
            chartright=this.ChartBorder.GetBottom();
        }

        var sellData=this.TradeData.Sell;
        var buyData=this.TradeData.Buy;
        var iconSize=dataWidth+distanceWidth;
        var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
        var iconSizeMax=24*pixelTatio,iconSizeMin=12*pixelTatio;
        if (iconSize<iconSizeMin) iconSize=iconSizeMin;
        else if (iconSize>iconSizeMax) iconSize=iconSizeMax;
        this.Canvas.font=iconSize+'px '+this.TradeIcon.Family;

        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
        {
            var data=this.Data.Data[i];
            if (data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;

            var buy=false,sell=false;
            if (sellData && i<sellData.length) sell=sellData[i]>0;
            if (buyData && i<buyData.length) buy=buyData[i]>0;
            if (!sell && !buy) continue;

            var left=xOffset;
            var right=xOffset+dataWidth;
            if (right>chartright) break;
            var x=left+(right-left)/2;
            var yLow=this.ChartFrame.GetYFromData(data.Low);
            var yHigh=this.ChartFrame.GetYFromData(data.High);
            var yOpen=this.ChartFrame.GetYFromData(data.Open);
            var yClose=this.ChartFrame.GetYFromData(data.Close);
            var y=yHigh;

            if (buy)
            {
                this.Canvas.fillStyle=this.TradeIcon.Buy.Color;
                
                if (isHScreen)
                {
                    this.Canvas.textAlign='right';
                    this.Canvas.textBaseline='middle';
                    this.Canvas.fillText(this.TradeIcon.Buy.HScreenText,yLow,x);
                }
                else
                {
                    this.Canvas.textAlign='center';
                    this.Canvas.textBaseline='top';
                    this.Canvas.fillText(this.TradeIcon.Buy.Text,x,yLow);
                }
            }

            if (sell)
            {
                this.Canvas.fillStyle=this.TradeIcon.Sell.Color;
                if (isHScreen)
                {
                    this.Canvas.textAlign='left';
                    this.Canvas.textBaseline='middle';
                    this.Canvas.fillText(this.TradeIcon.Sell.HScreenText,yHigh,x);
                }
                else
                {
                    this.Canvas.textAlign='center';
                    this.Canvas.textBaseline='bottom';
                    this.Canvas.fillText(this.TradeIcon.Sell.Text,x,yHigh);
                }
            }
        }
    }

    
    /*
    //画某一天的信息地雷
    this.DrawInfoDiv=function(item)
    {
        if (!this.InfoData || this.InfoData.length<=0) return;

        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;

        var infoData=this.InfoData.get(item.DayData.Date.toString());
        if (!infoData || infoData.Data.length<=0) return;

        var divInfo=document.createElement("div");
        divInfo.className='kline-info';
        divInfo.id=Guid();
        var iconWidth=Math.abs(item.Xleft-item.XRight);
        if (iconWidth>16)
        {
            iconWidth=16;
            item.Xleft=item.Xleft+(Math.abs(item.Xleft-item.XRight)-iconWidth)/2;
        }

        var text='', title='';
        var mapImage=new Map();
        for(var i in infoData.Data)
        {
            var infoItem=infoData.Data[i];
            var iconSrc=JSKLineInfoMap.GetIconUrl(infoItem.InfoType);
            var imageInfo=mapImage.get(infoItem.InfoType);
            if (!imageInfo)
            {
                divInfo.innerHTML+="<img src='"+iconSrc+"'"+ " infotype='"+infoItem.InfoType+"' />";
                mapImage.set(infoItem.InfoType,new Array(infoItem) );
            }
            else
            {
                imageInfo.push(infoItem);
            }
            title+='\n'+infoItem.Title;
        }

        //divInfo.innerHTML=text;
        var scrollPos=GetScrollPosition();
        var left = item.Xleft+ this.ChartBorder.UIElement.getBoundingClientRect().left+scrollPos.Left;
        var top = item.YMax+this.ChartBorder.UIElement.getBoundingClientRect().top+scrollPos.Top-5;

        divInfo.style.left = left + "px";
        divInfo.style.top = top-(mapImage.size*16) + "px";
        //divInfo.title=title;
        this.ChartBorder.UIElement.parentNode.appendChild(divInfo);

        if (this.InfoTooltipEvent && this.InfoTooltipEvent.length>=2)
        {
            if (typeof(this.InfoTooltipEvent[0])=='function')
            {
                var chart=this.ChartBorder.UIElement.JSChartContainer;
                var self=this;
                mapImage.forEach(function(item,key,data)
                {
                    //绑定鼠标悬浮消息
                    $("#"+divInfo.id+" img[infotype='"+key+"']").mouseover(
                    {
                            Chart:chart,    //图形类
                            InfoType:key,   //信息地雷类型
                            InfoList:item,  //信息数据列表
                    },
                    self.InfoTooltipEvent[0]);
                });
            }

            if (typeof(this.InfoTooltipEvent[1])=='function')
            {
                var chart=this.ChartBorder.UIElement.JSChartContainer;
                var self=this;
                mapImage.forEach(function(item,key,data)
                {
                    //绑定鼠标离开
                    $("#"+divInfo.id+" img[infotype='"+key+"']").mouseleave(
                    {
                            Chart:chart,    //图形类
                    },
                    self.InfoTooltipEvent[1]);
                });
            }
        }

        this.InfoDiv.push(divInfo);
    }
    */

    this.GetTooltipData=function(x,y,tooltip)
    {
        for(var i in this.InfoTooltipRect)
        {
            var item=this.InfoTooltipRect[i];
            if (!item.Rect) continue;
            var rect=item.Rect;
            this.Canvas.beginPath();
            this.Canvas.rect(rect.X,rect.Y,rect.Width,rect.Height);
            if (this.Canvas.isPointInPath(x,y))
            {
                //console.log('[ChartKLine::GetTooltipData]', item);
                tooltip.Data=item;
                tooltip.ChartPaint=this;
                tooltip.Type=1; //信息地雷
                return true;
            }
        }

        for(var i in this.TooltipRect)
        {
            var rect=this.TooltipRect[i][1];
            this.Canvas.beginPath();
            this.Canvas.rect(rect.X,rect.Y,rect.Width,rect.Height);
            if (this.Canvas.isPointInPath(x,y))
            {
                var index=this.TooltipRect[i][0];
                tooltip.Data=this.Data.Data[index];
                tooltip.ChartPaint=this;
                tooltip.Type=0; //K线信息
                return true;
            }
        }
        return false;
    }

    //计算当天显示数据的最大最小值
    this.GetMaxMin=function()
    {
        var xPointCount=this.ChartFrame.XPointCount;
        var range={};
        range.Max=null;
        range.Min=null;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var data=this.Data.Data[i];
            if (data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;

            if (range.Max==null) range.Max=data.High;
            if (range.Min==null) range.Min=data.Low;

            if (range.Max<data.High) range.Max=data.High;
            if (range.Min>data.Low) range.Min=data.Low;
        }

        return range;
    }
}

//K线叠加 支持横屏
function ChartOverlayKLine()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Color="rgb(65,105,225)";
    this.MainData;                  //主图K线数据
    this.SourceData;                //叠加的原始数据
    this.Name="ChartOverlayKLine";
    this.Title;
    this.DrawType=0;

    this.DrawKBar=function(firstOpen)   //firstOpen 当前屏第1个显示数据
    {
        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var xOffset=this.ChartBorder.GetLeft()+distanceWidth/2.0+2.0;
        if (isHScreen) xOffset=this.ChartBorder.GetTop()+distanceWidth/2.0+2.0;
        var chartright=this.ChartBorder.GetRight();
        if (isHScreen) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;

        var isFristDraw=true;
        var firstOverlayOpen=null;

        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
        {
            var data=this.Data.Data[i];
            if (!data || data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;

            if (firstOverlayOpen==null) firstOverlayOpen=data.Open;

            if (isFristDraw)
            {
                this.Canvas.strokeStyle=this.Color;
                this.Canvas.fillStyle=this.Color;
                this.Canvas.beginPath();
                isFristDraw=false;
            }

            var left=xOffset;
            var right=xOffset+dataWidth;
            if (right>chartright) break;
            var x=left+(right-left)/2;
            var yLow=this.ChartFrame.GetYFromData(data.Low/firstOverlayOpen*firstOpen);
            var yHigh=this.ChartFrame.GetYFromData(data.High/firstOverlayOpen*firstOpen);
            var yOpen=this.ChartFrame.GetYFromData(data.Open/firstOverlayOpen*firstOpen);
            var yClose=this.ChartFrame.GetYFromData(data.Close/firstOverlayOpen*firstOpen);
            var y=yHigh;

            if (data.Open<data.Close)       //阳线
            {
                if (dataWidth>=4)
                {
                    if (data.High>data.Close)   //上影线
                    {
                        if (isHScreen)
                        {
                            this.Canvas.moveTo(ToFixedPoint(y),ToFixedPoint(x));
                            this.Canvas.lineTo(ToFixedPoint(this.DrawType==3?Math.max(yClose,yOpen):yClose),ToFixedPoint(x));
                        }
                        else
                        {
                            this.Canvas.moveTo(ToFixedPoint(x),ToFixedPoint(y));
                            this.Canvas.lineTo(ToFixedPoint(x),ToFixedPoint(this.DrawType==3?Math.min(yClose,yOpen):yClose));
                        }
                        y=yClose;
                    }
                    else
                    {
                        y=yClose;
                    }

                    if (isHScreen)
                    {
                        if (Math.abs(yOpen-y)<1)  
                        {
                            this.Canvas.fillRect(ToFixedRect(y),ToFixedRect(left),1,ToFixedRect(dataWidth));    //高度小于1,统一使用高度1
                        }
                        else 
                        {
                            if (this.DrawType==3) this.Canvas.rect(ToFixedPoint(y),ToFixedPoint(left),ToFixedRect(yOpen-y),ToFixedRect(dataWidth));   //空心柱
                            else this.Canvas.fillRect(ToFixedRect(y),ToFixedRect(left),ToFixedRect(yOpen-y),ToFixedRect(dataWidth));
                        }
                    }
                    else
                    {
                        if (Math.abs(yOpen-y)<1)  
                        {
                            this.Canvas.fillRect(ToFixedRect(left),ToFixedRect(y),ToFixedRect(dataWidth),1);    //高度小于1,统一使用高度1
                        }
                        else 
                        {
                            if (this.DrawType==3) this.Canvas.rect(ToFixedPoint(left),ToFixedPoint(y),ToFixedRect(dataWidth),ToFixedRect(yOpen-y));   //空心柱
                            else this.Canvas.fillRect(ToFixedRect(left),ToFixedRect(y),ToFixedRect(dataWidth),ToFixedRect(yOpen-y));
                        }
                    }

                    if (data.Open>data.Low)
                    {
                        if (isHScreen)
                        {
                            this.Canvas.moveTo(ToFixedPoint(this.DrawType==3?Math.min(yClose,yOpen):y),ToFixedPoint(x));
                            this.Canvas.lineTo(ToFixedPoint(yLow),ToFixedPoint(x));
                        }
                        else
                        {
                            this.Canvas.moveTo(ToFixedPoint(x),ToFixedPoint(this.DrawType==3?Math.max(yClose,yOpen):y));
                            this.Canvas.lineTo(ToFixedPoint(x),ToFixedPoint(yLow));
                        }
                    }
                }
                else
                {
                    if (isHScreen)
                    {
                        this.Canvas.moveTo(yHigh,ToFixedPoint(x),);
                        this.Canvas.lineTo(yLow,ToFixedPoint(x));
                    }
                    else
                    {
                        this.Canvas.moveTo(ToFixedPoint(x),yHigh);
                        this.Canvas.lineTo(ToFixedPoint(x),yLow);
                    }
                }
            }
            else if (data.Open>data.Close)  //阴线
            {
                if (dataWidth>=4)
                {
                    if (data.High>data.Close)   //上影线
                    {
                        if (isHScreen)
                        {
                            this.Canvas.moveTo(ToFixedPoint(y),ToFixedPoint(x));
                            this.Canvas.lineTo(ToFixedPoint(yOpen),ToFixedPoint(x));
                        }
                        else
                        {
                            this.Canvas.moveTo(ToFixedPoint(x),ToFixedPoint(y));
                            this.Canvas.lineTo(ToFixedPoint(x),ToFixedPoint(yOpen));
                        }
                        y=yOpen;
                    }
                    else
                    {
                        y=yOpen
                    }

                    if (isHScreen)
                    {
                        if (Math.abs(yClose-y)<1) this.Canvas.fillRect(ToFixedRect(y),ToFixedRect(left),1,ToFixedRect(dataWidth));    //高度小于1,统一使用高度1
                        else this.Canvas.fillRect(ToFixedRect(y),ToFixedRect(left),ToFixedRect(yClose-y),ToFixedRect(dataWidth));
                    }
                    else
                    {
                        if (Math.abs(yClose-y)<1) this.Canvas.fillRect(ToFixedRect(left),ToFixedRect(y),ToFixedRect(dataWidth),1);    //高度小于1,统一使用高度1
                        else this.Canvas.fillRect(ToFixedRect(left),ToFixedRect(y),ToFixedRect(dataWidth),ToFixedRect(yClose-y));
                    }

                    if (data.Open>data.Low) //下影线
                    {
                        if (isHScreen)
                        {
                            this.Canvas.moveTo(ToFixedPoint(y),ToFixedPoint(x));
                            this.Canvas.lineTo(ToFixedPoint(yLow),ToFixedPoint(x));
                        }
                        else
                        {
                            this.Canvas.moveTo(ToFixedPoint(x),ToFixedPoint(y));
                            this.Canvas.lineTo(ToFixedPoint(x),ToFixedPoint(yLow));
                        }
                    }
                }
                else
                {
                    if (isHScreen)
                    {
                        this.Canvas.moveTo(yHigh,ToFixedPoint(x),);
                        this.Canvas.lineTo(yLow,ToFixedPoint(x));
                    }
                    else
                    {
                        this.Canvas.moveTo(ToFixedPoint(x),yHigh);
                        this.Canvas.lineTo(ToFixedPoint(x),yLow);
                    } 
                }
            }
            else // 平线
            {
                if (dataWidth>=4)
                {
                    if (data.High>data.Close)   //上影线
                    {
                        if (isHScreen)
                        {
                            this.Canvas.moveTo(y,ToFixedPoint(x));
                            this.Canvas.lineTo(yOpen,ToFixedPoint(x));
                        }
                        else
                        {
                            this.Canvas.moveTo(ToFixedPoint(x),y);
                            this.Canvas.lineTo(ToFixedPoint(x),yOpen);
                        }

                        y=yOpen;
                    }
                    else
                    {
                        y=yOpen;
                    }

                    if (isHScreen)
                    {
                        this.Canvas.moveTo(ToFixedPoint(y),ToFixedPoint(left));
                        this.Canvas.lineTo(ToFixedPoint(y),ToFixedPoint(right));
                    }
                    else
                    {
                        this.Canvas.moveTo(ToFixedPoint(left),ToFixedPoint(y));
                        this.Canvas.lineTo(ToFixedPoint(right),ToFixedPoint(y));
                    }

                    if (data.Open>data.Low) //下影线
                    {
                        if (isHScreen)
                        {
                            this.Canvas.moveTo(ToFixedPoint(y),ToFixedPoint(x));
                            this.Canvas.lineTo(ToFixedPoint(yLow),ToFixedPoint(x));
                        }
                        else
                        {
                            this.Canvas.moveTo(ToFixedPoint(x),ToFixedPoint(y));
                            this.Canvas.lineTo(ToFixedPoint(x),ToFixedPoint(yLow));
                        }
                    }
                }
                else
                {
                    if (isHScreen)
                    {
                        this.Canvas.moveTo(yHigh,ToFixedPoint(x));
                        this.Canvas.lineTo(yLow,ToFixedPoint(x));
                    }
                    else
                    {
                        this.Canvas.moveTo(ToFixedPoint(x),yHigh);
                        this.Canvas.lineTo(ToFixedPoint(x),yLow);
                    }
                }
            }

            //添加tooltip区域
            {
                var yTop=Math.min(yLow,yHigh,yOpen,yClose);
                var yBottom=Math.max(yLow,yHigh,yOpen,yClose);
                var rect=new Rect(left,yTop,dataWidth,yBottom-yTop);
                //this.Canvas.fillStyle="rgb(0,0,100)";
                //this.Canvas.fillRect(rect.X,rect.Y,rect.Width,rect.Height);
                this.TooltipRect.push([i,rect]);    //[0]数据索引 [1]数据区域
            }
        }

        if (isFristDraw==false) this.Canvas.stroke();
    }

    this.DrawAKLine=function(firstOpen) //美国线
    {
        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var xOffset=this.ChartBorder.GetLeft()+distanceWidth/2.0+2.0;
        if (isHScreen) xOffset=this.ChartBorder.GetTop()+distanceWidth/2.0+2.0;
        var chartright=this.ChartBorder.GetRight();
        if (isHScreen) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;

        var firstOverlayOpen=null;
        this.Canvas.strokeStyle=this.Color;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
        {
            var data=this.Data.Data[i];
            if (data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;

            if (firstOverlayOpen==null) firstOverlayOpen=data.Open;
            var left=xOffset;
            var right=xOffset+dataWidth;
            if (right>chartright) break;
            var x=left+(right-left)/2;
            var yLow=this.ChartFrame.GetYFromData(data.Low/firstOverlayOpen*firstOpen);
            var yHigh=this.ChartFrame.GetYFromData(data.High/firstOverlayOpen*firstOpen);
            var yOpen=this.ChartFrame.GetYFromData(data.Open/firstOverlayOpen*firstOpen);
            var yClose=this.ChartFrame.GetYFromData(data.Close/firstOverlayOpen*firstOpen);

            this.Canvas.beginPath();   //最高-最低
            if (isHScreen)
            {
                this.Canvas.moveTo(yHigh,ToFixedPoint(x));
                this.Canvas.lineTo(yLow,ToFixedPoint(x));
            }
            else
            {
                this.Canvas.moveTo(ToFixedPoint(x),yHigh);
                this.Canvas.lineTo(ToFixedPoint(x),yLow);
            }
            
            this.Canvas.stroke();

            if (dataWidth>=4)
            {
                this.Canvas.beginPath();    //开盘
                if (isHScreen)
                {
                    this.Canvas.moveTo(ToFixedPoint(yOpen),left);
                    this.Canvas.lineTo(ToFixedPoint(yOpen),x);
                }
                else
                {
                    this.Canvas.moveTo(left,ToFixedPoint(yOpen));
                    this.Canvas.lineTo(x,ToFixedPoint(yOpen));
                }
                this.Canvas.stroke();

                this.Canvas.beginPath();    //收盘
                if (isHScreen)
                {
                    this.Canvas.moveTo(ToFixedPoint(yClose),right);
                    this.Canvas.lineTo(ToFixedPoint(yClose),x);
                }
                else
                {
                    this.Canvas.moveTo(right,ToFixedPoint(yClose));
                    this.Canvas.lineTo(x,ToFixedPoint(yClose));
                }
                this.Canvas.stroke();
            }
        }

    }

    this.DrawCloseLine=function(firstOpen)  //收盘价线
    {
        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var xOffset=this.ChartBorder.GetLeft()+distanceWidth/2.0+2.0;
        if (isHScreen) xOffset=this.ChartBorder.GetTop()+distanceWidth/2.0+2.0;
        var chartright=this.ChartBorder.GetRight();
        if (isHScreen) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;

        var firstOverlayOpen=null;
        var bFirstPoint=true;
        this.Canvas.strokeStyle=this.Color;
        this.Canvas.beginPath();
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
        {
            var data=this.Data.Data[i];
            if (data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;

            if (firstOverlayOpen==null) firstOverlayOpen=data.Open;
            var left=xOffset;
            var right=xOffset+dataWidth;
            if (right>chartright) break;
            var x=left+(right-left)/2;
            var yClose=this.ChartFrame.GetYFromData(data.Close/firstOverlayOpen*firstOpen);

            if (bFirstPoint)
            {
                if (isHScreen) this.Canvas.moveTo(yClose,x);
                else this.Canvas.moveTo(x,yClose);
                bFirstPoint=false;
            }
            else
            {
                if (isHScreen) this.Canvas.lineTo(yClose,x);
                else this.Canvas.lineTo(x,yClose);
            }
        }

        if (bFirstPoint==false) this.Canvas.stroke();
    }

    this.Draw=function()
    {
        this.TooltipRect=[];
        this.InfoTooltipRect=[];
        if (!this.MainData || !this.Data) return;

        var xPointCount=this.ChartFrame.XPointCount;
        var firstOpen=null; //主线数据第1个开盘价
        for(var i=this.Data.DataOffset,j=0;i<this.MainData.Data.length && j<xPointCount;++i,++j)
        {
            var data=this.MainData.Data[i];
            if (data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;
            firstOpen=data.Open;
            break;
        }

        if (firstOpen==null) return;

        if (this.DrawType==1)
            this.DrawCloseLine(firstOpen);
        else if (this.DrawType==2)
            this.DrawAKLine(firstOpen);
        else
            this.DrawKBar(firstOpen);
    }

    this.GetMaxMin=function()
    {
        var xPointCount=this.ChartFrame.XPointCount;
        var range={};
        range.Max=null;
        range.Min=null;

        if (!this.MainData || !this.Data) return range;

        var firstOpen=null; //主线数据第1个收盘价
        for(var i=this.Data.DataOffset,j=0;i<this.MainData.Data.length && j<xPointCount;++i,++j)
        {
            var data=this.MainData.Data[i];
            if (data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;
            firstOpen=data.Close;
            break;
        }

        if (firstOpen==null) return range;

        var firstOverlayOpen=null;
        var high,low;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var data=this.Data.Data[i];
            if (!data || data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;
            if (firstOverlayOpen==null) firstOverlayOpen=data.Open;

            high=data.High/firstOverlayOpen*firstOpen;
            low=data.Low/firstOverlayOpen*firstOpen;
            if (range.Max==null) range.Max=high;
            if (range.Min==null) range.Min=low;

            if (range.Max<high) range.Max=high;
            if (range.Min>low) range.Min=low;
        }

        return range;
    }

    this.GetTooltipData=function(x,y,tooltip)
    {
        for(var i in this.TooltipRect)
        {
            var rect=this.TooltipRect[i][1];
            this.Canvas.beginPath();
            this.Canvas.rect(rect.X,rect.Y,rect.Width,rect.Height);
            if (this.Canvas.isPointInPath(x,y))
            {
                var index=this.TooltipRect[i][0];
                tooltip.Data=this.Data.Data[index];
                tooltip.ChartPaint=this;
                return true;
            }
        }
        return false;
    }
}

//分钟成交量 支持横屏
function ChartMinuteVolumBar()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.UpColor = g_JSChartResource.UpBarColor;
    this.DownColor = g_JSChartResource.DownBarColor;
    this.YClose;    //前收盘

    this.Draw=function()
    {
        var isHScreen = (this.ChartFrame.IsHScreen === true);
        var chartright=this.ChartBorder.GetRight();
        if (isHScreen) chartright = this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;
        var yBottom=this.ChartFrame.GetYFromData(0);
        var yPrice=this.YClose; //上一分钟的价格
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var item = this.Data.Data[i];
            if (!item || !item.Vol) continue;

            var y=this.ChartFrame.GetYFromData(item.Vol);
            var x=this.ChartFrame.GetXFromIndex(i);
            if (x>chartright) break;

            //价格>=上一分钟价格 红色 否则绿色
            this.Canvas.strokeStyle = item.Close >= yPrice ? this.UpColor:this.DownColor;
            this.Canvas.beginPath();
            if (isHScreen)
            {
                this.Canvas.moveTo(y,ToFixedPoint(x));
                this.Canvas.lineTo(yBottom,ToFixedPoint(x));
            }
            else
            {
                this.Canvas.moveTo(ToFixedPoint(x),y);
                this.Canvas.lineTo(ToFixedPoint(x),yBottom);
            }
            this.Canvas.stroke();
            yPrice=item.Close;
        }
    }

    this.GetMaxMin=function()
    {
        var xPointCount=this.ChartFrame.XPointCount;
        var range={};
        range.Min=0;
        range.Max=null;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var item = this.Data.Data[i];
            if (!item || !item.Vol) continue;
            if (range.Max == null) range.Max = item.Vol;
            if (range.Max < item.Vol) range.Max = item.Vol;
        }

        return range;
    }
}


//线段 支持横屏
function ChartLine()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Color="rgb(255,193,37)";   //线段颜色
    this.LineWidth;                 //线段宽度
    this.DrawType=0;                //画图方式  0=无效数平滑  1=无效数不画断开

    this.Draw=function()
    {
        if (!this.IsShow)
            return;
        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        if (!this.Data || !this.Data.Data) return;

        switch(this.DrawType)
        {
            case 0:
                return this.DrawLine();
            case 1: 
                return this.DrawStraightLine();
        }
    }

    this.DrawLine=function()
    {
        var bHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var chartright=this.ChartBorder.GetRight();
        if (bHScreen) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;
        
        this.Canvas.save();
        if (this.LineWidth>0) this.Canvas.lineWidth=this.LineWidth * GetDevicePixelRatio();
        var bFirstPoint=true;
        var drawCount=0;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (value==null) continue;

            var x=this.ChartFrame.GetXFromIndex(j);
            var y=this.ChartFrame.GetYFromData(value);

            if (x>chartright) break;

            if (bFirstPoint)
            {
                this.Canvas.strokeStyle=this.Color;
                this.Canvas.beginPath();
                if (bHScreen) this.Canvas.moveTo(y,x);  //横屏坐标轴对调
                else this.Canvas.moveTo(x,y);
                bFirstPoint=false;
            }
            else
            {
                if (bHScreen) this.Canvas.lineTo(y,x);
                else this.Canvas.lineTo(x,y);
            }

            ++drawCount;
        }

        if (drawCount>0) this.Canvas.stroke();
        this.Canvas.restore();
    }

    //无效数不画
    this.DrawStraightLine=function()
    {
        var bHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var chartright=this.ChartBorder.GetRight();
        if (bHScreen) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;

        this.Canvas.save();
        if (this.LineWidth>0) this.Canvas.lineWidth=this.LineWidth * GetDevicePixelRatio();
        this.Canvas.strokeStyle=this.Color;

        var bFirstPoint=true;
        var drawCount=0;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (value==null) 
            {
                if (drawCount>0) this.Canvas.stroke();
                bFirstPoint=true;
                drawCount=0;
                continue;
            }

            var x=this.ChartFrame.GetXFromIndex(j);
            var y=this.ChartFrame.GetYFromData(value);

            if (x>chartright) break;

            if (bFirstPoint)
            {
                this.Canvas.beginPath();
                if (bHScreen) this.Canvas.moveTo(y,x);  //横屏坐标轴对调
                else this.Canvas.moveTo(x,y);
                bFirstPoint=false;
            }
            else
            {
                if (bHScreen) this.Canvas.lineTo(y,x);
                else this.Canvas.lineTo(x,y);
            }

            ++drawCount;
        }

        if (drawCount>0) this.Canvas.stroke();
        this.Canvas.restore();
    }
}


//POINTDOT 圆点 支持横屏
function ChartPointDot()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Color="rgb(255,193,37)";   //线段颜色
    this.Radius=1;                  //点半径

    this.Draw=function()
    {
        if (!this.IsShow) return;

        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        if (!this.Data || !this.Data.Data) return;

        var bHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var chartright=this.ChartBorder.GetRight();
        if (bHScreen===true) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;

        this.Canvas.save();
        this.Canvas.fillStyle=this.Color;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (value==null) continue;

            var x=this.ChartFrame.GetXFromIndex(j);
            var y=this.ChartFrame.GetYFromData(value);

            if (x>chartright) break;

            this.Canvas.beginPath();
            if (bHScreen) this.Canvas.arc(y, x, this.Radius, 0, Math.PI*2, true);
            else this.Canvas.arc(x, y, this.Radius, 0, Math.PI*2, true);
            this.Canvas.closePath();
            this.Canvas.fill();
        }

        this.Canvas.restore();
    }
}

//通达信语法  STICK 支持横屏
function ChartStick()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Color="rgb(255,193,37)";   //线段颜色
    this.LineWidth;               //线段宽度
    this.ClassName='ChartStick';

    this.DrawLine=function()
    {
        if (!this.Data || !this.Data.Data) return;

        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var chartright=this.ChartBorder.GetRight();
        if (isHScreen===true) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;

        this.Canvas.save();
        if (this.LineWidth>0) this.Canvas.lineWidth=this.LineWidth * GetDevicePixelRatio();
        var bFirstPoint=true;
        var drawCount=0;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (value==null) continue;

            var x=this.ChartFrame.GetXFromIndex(j);
            var y=this.ChartFrame.GetYFromData(value);

            if (x>chartright) break;

            if (bFirstPoint)
            {
                this.Canvas.strokeStyle=this.Color;
                this.Canvas.beginPath();
                if (isHScreen) this.Canvas.moveTo(y,x);
                else this.Canvas.moveTo(x,y);
                bFirstPoint=false;
            }
            else
            {
                if (isHScreen) this.Canvas.lineTo(y,x);
                else this.Canvas.lineTo(x,y);
            }

            ++drawCount;
        }

        if (drawCount>0) this.Canvas.stroke();
        this.Canvas.restore();
    }

    this.DrawStick=function()
    {
        if (!this.Data || !this.Data.Data) return;
        var bHScreen=(this.ChartFrame.IsHScreen===true);
        var chartright=this.ChartBorder.GetRight();
        if (bHScreen) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;
        var yBottom=this.ChartBorder.GetBottom();
        var xLeft=this.ChartBorder.GetLeft();

        this.Canvas.save();
        this.Canvas.strokeStyle=this.Color;
        if (this.LineWidth) this.Canvas.lineWidth=this.LineWidth * GetDevicePixelRatio();
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (value==null) continue;

            var x=this.ChartFrame.GetXFromIndex(j);
            var y=this.ChartFrame.GetYFromData(value);

            if (x>chartright) break;

            this.Canvas.beginPath();
            if (bHScreen)
            {
                this.Canvas.moveTo(xLeft,x);  
                this.Canvas.lineTo(y,x);
                this.Canvas.stroke();
            }
            else
            {
                var xFix=parseInt(x.toString())+0.5;
                this.Canvas.moveTo(xFix,y);  
                this.Canvas.lineTo(xFix,yBottom);
            }
            this.Canvas.stroke();
        }

        this.Canvas.restore();
    }

    this.Draw=function()
    {
        if (!this.IsShow) return;

        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        if (!this.Data || !this.Data.Data) return;

        this.DrawStick();
    }
}

//通达信语法 LINESTICK 支持横屏
function ChartLineStick()
{
    this.newMethod=ChartStick;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartLineStick';

    this.Draw=function()
    {
        if (!this.IsShow) return;

        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        this.DrawStick();
        this.DrawLine();
    }
}

//通达信语法 VOLSTICK 支持横屏
function ChartVolStick()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.UpColor=g_JSChartResource.UpBarColor;
    this.DownColor=g_JSChartResource.DownBarColor;
    this.HistoryData;               //历史数据
    this.KLineDrawType=0;
    this.ClassName='ChartVolStick';

    this.Draw=function()
    {
        if (this.ChartFrame.IsHScreen===true) 
        {
            this.HScreenDraw();
            return;
        }

        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var xOffset=this.ChartBorder.GetLeft()+distanceWidth/2.0+2.0;
        var chartright=this.ChartBorder.GetRight();
        var xPointCount=this.ChartFrame.XPointCount;

        var yBottom=this.ChartFrame.GetYFromData(0);

        if (dataWidth>=4)
        {
            yBottom=ToFixedRect(yBottom);
            for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
            {
                var value=this.Data.Data[i];
                var kItem=this.HistoryData.Data[i];
                if (value==null || kItem==null) continue;

                var left=xOffset;
                var right=xOffset+dataWidth;
                if (right>chartright) break;

                var y=this.ChartFrame.GetYFromData(value);
                var bUp=false;
                if (kItem.Close>=kItem.Open)
                {
                    this.Canvas.fillStyle=this.UpColor;
                    bUp=true;
                }
                else
                {
                    this.Canvas.fillStyle=this.DownColor;
                }
                
                var height=ToFixedRect(yBottom-y);//高度调整为整数
                y=yBottom-height;
                if (bUp && (this.KLineDrawType==1 || this.KLineDrawType==2 || this.KLineDrawType==3)) //空心柱子
                {
                    this.Canvas.strokeStyle=this.UpColor;
                    this.Canvas.beginPath();
                    this.Canvas.rect(ToFixedPoint(left),ToFixedPoint(y),ToFixedRect(dataWidth),height);
                    this.Canvas.stroke();
                }
                else
                {
                    this.Canvas.fillRect(ToFixedRect(left),y,ToFixedRect(dataWidth),height);
                }
            }
        }
        else    //太细了直接话线
        {
            for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
            {
                var value=this.Data.Data[i];
                var kItem=this.HistoryData.Data[i];
                if (value==null || kItem==null) continue;

                var y=this.ChartFrame.GetYFromData(value);
                var x=this.ChartFrame.GetXFromIndex(j);
                if (x>chartright) break;

                if (kItem.Close>kItem.Open)
                    this.Canvas.strokeStyle=this.UpColor;
                else
                    this.Canvas.strokeStyle=this.DownColor;

                var x=this.ChartFrame.GetXFromIndex(j);
                this.Canvas.beginPath();
                this.Canvas.moveTo(ToFixedPoint(x),y);
                this.Canvas.lineTo(ToFixedPoint(x),yBottom);
                this.Canvas.stroke();
            }
        }
    }

    this.HScreenDraw=function() //横屏画法
    {
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var xOffset=this.ChartBorder.GetTop()+distanceWidth/2.0+2.0;
        var chartBottom=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;

        var yBottom=this.ChartFrame.GetYFromData(0);

        if (dataWidth>=4)
        {
            yBottom=ToFixedRect(yBottom);
            for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
            {
                var value=this.Data.Data[i];
                var kItem=this.HistoryData.Data[i];
                if (value==null || kItem==null) continue;

                var left=xOffset;
                var right=xOffset+dataWidth;
                if (right>chartBottom) break;

                var y=this.ChartFrame.GetYFromData(value);
                var bUp=false;
                if (kItem.Close>=kItem.Open)
                {
                    bUp=true;
                    this.Canvas.fillStyle=this.UpColor;
                }
                else
                {
                    this.Canvas.fillStyle=this.DownColor;
                }
                
                var height=ToFixedRect(y-yBottom);  //高度调整为整数
                if (bUp && (this.KLineDrawType==1 || this.KLineDrawType==2 || this.KLineDrawType==3)) //空心柱子
                {
                    this.Canvas.strokeStyle=this.UpColor;
                    this.Canvas.beginPath();
                    this.Canvas.rect(ToFixedPoint(yBottom),ToFixedPoint(left),height,ToFixedRect(dataWidth));
                    this.Canvas.stroke();
                }
                else
                {
                    this.Canvas.fillRect(yBottom,ToFixedRect(left),height,ToFixedRect(dataWidth));
                }
            }
        }
        else    //太细了直接话线
        {
            for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
            {
                var value=this.Data.Data[i];
                var kItem=this.HistoryData.Data[i];
                if (value==null || kItem==null) continue;

                var y=this.ChartFrame.GetYFromData(value);
                var x=this.ChartFrame.GetXFromIndex(j);
                if (x>chartBottom) break;

                if (kItem.Close>kItem.Open)
                    this.Canvas.strokeStyle=this.UpColor;
                else
                    this.Canvas.strokeStyle=this.DownColor;

                var x=this.ChartFrame.GetXFromIndex(j);
                this.Canvas.beginPath();
                this.Canvas.moveTo(y,ToFixedPoint(x));
                this.Canvas.lineTo(yBottom,ToFixedPoint(x));
                this.Canvas.stroke();
            }
        }
    }

    this.GetMaxMin=function()
    {
        var xPointCount=this.ChartFrame.XPointCount;
        var range={};
        range.Min=0;
        range.Max=null;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (range.Max==null) range.Max=value;

            if (range.Max<value) range.Max=value;
        }

        return range;
    }
}



//线段 多数据(一个X点有多条Y数据) 支持横屏
function ChartLineMultiData()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Color="rgb(255,193,37)"; //线段颜色

    this.Draw=function()
    {
        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        if (!this.Data || !this.Data.Data) return;

        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var chartright=this.ChartBorder.GetRight();
        if (isHScreen) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;

        var bFirstPoint=true;
        var drawCount=0;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var aryValue=this.Data.Data[i];
            if (aryValue==null) continue;

            var x=this.ChartFrame.GetXFromIndex(j);
            if (x>chartright) break;

            for(var index in aryValue)
            {
                var value =aryValue[index].Value;
                
                var y=this.ChartFrame.GetYFromData(value);

                if (bFirstPoint)
                {
                    this.Canvas.strokeStyle=this.Color;
                    this.Canvas.beginPath();
                    if (isHScreen) this.Canvas.moveTo(y,x);
                    else this.Canvas.moveTo(x,y);
                    bFirstPoint=false;
                }
                else
                {
                    if (isHScreen) this.Canvas.lineTo(y,x);
                    else this.Canvas.lineTo(x,y);
                }

                ++drawCount;
            }
        }

        if (drawCount>0)
            this.Canvas.stroke();
    }

    this.GetMaxMin=function()
    {
        var xPointCount=this.ChartFrame.XPointCount;
        var range={};
        range.Min=null;
        range.Max=null;

        if(!this.Data || !this.Data.Data) return range;

        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var aryValue=this.Data.Data[i];
            if (aryValue==null) continue;

            for(var index in aryValue)
            {
                var value=aryValue[index].Value;
                if (range.Max==null) range.Max=value;
                if (range.Min==null) range.Min=value;

                if (range.Max<value) range.Max=value;
                if (range.Min>value) range.Min=value;
            }
        }

        return range;
    }
}

//柱子 支持横屏
function ChartStickLine()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Color="rgb(255,193,37)";               //线段颜色
    this.LineWidth=2*GetDevicePixelRatio();     //线段宽度

    this.Draw=function()
    {
        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        if (!this.Data || !this.Data.Data) return;

        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var chartright=this.ChartBorder.GetRight();
        if (isHScreen) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;
        var xOffset=this.ChartBorder.GetLeft()+distanceWidth/2.0+2.0;
        if (isHScreen) xOffset=this.ChartBorder.GetTop()+distanceWidth/2.0+2.0;

        this.Canvas.save();
        var bFillBar=false;
        var bFillKLine=false;
        if (this.LineWidth==50) //宽度==50 跟K线宽度保持一致
        {
            if (dataWidth>=4)
            {
                bFillKLine=true; 
                this.Canvas.fillStyle=this.Color; 
            }
            else    //太细了 画竖线
            {
                this.Canvas.lineWidth=GetDevicePixelRatio();
                this.Canvas.strokeStyle=this.Color;
            }  
        }
        else if (this.LineWidth<100)
        {
            var LineWidth=this.LineWidth;
            if (dataWidth<=4) LineWidth=GetDevicePixelRatio();
            else if (dataWidth<LineWidth) LineWidth=parseInt(dataWidth);
            this.Canvas.lineWidth=LineWidth;
            this.Canvas.strokeStyle=this.Color;
        }
        else
        {
            bFillBar=true;
            this.Canvas.fillStyle=this.Color;
            var fixedWidth=2*GetDevicePixelRatio();
        }

        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
        {
            var value=this.Data.Data[i];
            if (value==null) continue;

            var price=value.Value;
            var price2=value.Value2;
            if (price2==null) price2=0;

            var x=this.ChartFrame.GetXFromIndex(j);
            var y=this.ChartFrame.GetYFromData(price);
            var y2=this.ChartFrame.GetYFromData(price2);

            if (x>chartright) break;

            if (bFillBar)
            {
                if (isHScreen)
                {
                    var left=xOffset-fixedWidth;
                    this.Canvas.fillRect(Math.min(y,y2),left,Math.abs(y-y2),dataWidth+distanceWidth+fixedWidth*2);
                }
                else
                {
                    var left=xOffset-fixedWidth;
                    var barWidth=dataWidth+distanceWidth+fixedWidth*2;
                    if (left+barWidth>chartright) barWidth=chartright-left; //不要超过右边框子
                    this.Canvas.fillRect(left,Math.min(y,y2),barWidth,Math.abs(y-y2));
                }
            }
            else if (bFillKLine)
            {
                if (isHScreen) 
                    this.Canvas.fillRect(ToFixedRect(Math.min(y,y2)),ToFixedRect(xOffset),ToFixedRect(Math.abs(y-y2)),ToFixedRect(dataWidth));
                else 
                    this.Canvas.fillRect(ToFixedRect(xOffset),ToFixedRect(Math.min(y,y2)),ToFixedRect(dataWidth),ToFixedRect(Math.abs(y-y2)));
            }
            else
            {
                if (isHScreen)
                {
                    this.Canvas.beginPath();
                    this.Canvas.moveTo(y,ToFixedPoint(x));
                    this.Canvas.lineTo(y2,ToFixedPoint(x));
                    this.Canvas.stroke();
                }
                else
                {
                    var xFix=parseInt(x.toString())+0.5;
                    this.Canvas.beginPath();
                    this.Canvas.moveTo(xFix,y);  
                    this.Canvas.lineTo(xFix,y2);
                    this.Canvas.stroke();
                }
            }
        }

        this.Canvas.restore();
    }

    this.GetMaxMin=function()
    {
        var xPointCount=this.ChartFrame.XPointCount;
        var range={};
        range.Min=null;
        range.Max=null;

        if(!this.Data || !this.Data.Data) return range;

        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var data=this.Data.Data[i];
            if (data == null) continue;
            var value2=data.Value2;
            if (value2==null) value2=0;
            if (data==null || isNaN(data.Value) ||isNaN(value2)) continue;

            var valueMax=Math.max(data.Value,value2);
            var valueMin=Math.min(data.Value,value2);
            
            if (range.Max==null) range.Max=valueMax;
            if (range.Min==null) range.Min=valueMin;

            if (range.Max<valueMax) range.Max=valueMax;
            if (range.Min>valueMin) range.Min=valueMin;
        }

        return range;
    }
}

function ChartText()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.TextFont="14px 微软雅黑";

    this.Draw=function()
    {
        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        if (!this.Data || !this.Data.Data) return;

        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var chartright=this.ChartBorder.GetRight();
        var xPointCount=this.ChartFrame.XPointCount;

        for(var i in this.Data.Data)
        {
            var value=this.Data.Data[i];
            if (value==null) continue;

            var price=value.Value;
            var position=value.Position;

            if (position=='Left')
            {
                var x=this.ChartFrame.GetXFromIndex(0);
                var y=this.ChartFrame.GetYFromData(price);

                if (x>chartright) continue;

                this.Canvas.textAlign='left';
                this.Canvas.textBaseline='middle';
                this.Canvas.fillStyle=value.Color;
                this.Canvas.font=this.TextFont;
                this.Canvas.fillText(value.Message,x,y);
            }

        }

    }

    this.GetMaxMin=function()
    {
        var xPointCount=this.ChartFrame.XPointCount;
        var range={};
        range.Min=null;
        range.Max=null;

        if(!this.Data || !this.Data.Data) return range;

        for(var i in this.Data.Data)
        {
            var data=this.Data.Data[i];
            if (data==null || isNaN(data.Value)) continue;

            var value=data.Value;
            
            if (range.Max==null) range.Max=value;
            if (range.Min==null) range.Min=value;

            if (range.Max<value) range.Max=value;
            if (range.Min>value) range.Min=value;
        }

        return range;
    }
}

/*
    文字输出 支持横屏
    数组不为null的数据中输出 this.Text文本
*/
function ChartSingleText()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Color="rgb(255,193,37)";           //线段颜色
    this.TextFont="14px 微软雅黑";           //线段宽度
    this.Text;
    this.TextAlign='left';
    this.Direction=0;       //0=middle 1=bottom 2=top
    this.YOffset=0;

    this.IconFont;  //Iconfont

    this.Draw=function()
    {
        if (!this.IsShow) return;

        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        if (!this.Data || !this.Data.Data) return;

        var isHScreen=(this.ChartFrame.IsHScreen===true)
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var chartright=this.ChartBorder.GetRight();
        var top=this.ChartBorder.GetTopEx();
        var bottom=this.ChartBorder.GetBottomEx();
        if (isHScreen) 
        {
            chartright=this.ChartBorder.GetBottom();
            top=this.ChartBorder.GetRightEx();
            bottom=this.ChartBorder.GetLeftEx();
        }
        var xPointCount=this.ChartFrame.XPointCount;

        var isArrayText=Array.isArray(this.Text);
        var pixelTatio = GetDevicePixelRatio();
        
        if (this.Direction==1) this.Canvas.textBaseline='bottom';
        else if (this.Direction==2) this.Canvas.textBaseline='top';
        else this.Canvas.textBaseline='middle';

        if (this.IconFont)
        {
            this.Color=this.IconFont.Color;
            this.Text=this.IconFont.Text;

            var iconSize=dataWidth;
            var minIconSize=12*pixelTatio;
            var maxIconSize=24*pixelTatio;
            if (iconSize<minIconSize) iconSize=minIconSize;
            else if (iconSize>maxIconSize) iconSize=maxIconSize;
            this.Canvas.font=iconSize+'px '+this.IconFont.Family;
        }
        else
        {
            this.TextFont=this.GetDynamicFont(dataWidth*2*pixelTatio);
            this.Canvas.font=this.TextFont;
        }

        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (value==null) continue;

            var x=this.ChartFrame.GetXFromIndex(j);
            var y=this.ChartFrame.GetYFromData(value);

            if (x>chartright) break;

            this.Canvas.textAlign=this.TextAlign;
            this.Canvas.fillStyle=this.Color;
            
            if (this.YOffset>0 && this.Direction>0)
            {
                var yPrice=y;

                this.Canvas.save(); 
                this.Canvas.setLineDash([5,10]);
                this.Canvas.strokeStyle=this.Color;
                this.Canvas.beginPath();
                if (isHScreen)
                {
                    if (this.Direction==1) 
                    {
                        y=top-this.YOffset*pixelTatio;
                        yPrice+=5*pixelTatio;
                    }
                    else 
                    {
                        y=bottom+this.YOffset*pixelTatio;
                        yPrice-=5*pixelTatio;
                    }
                    this.Canvas.moveTo(ToFixedPoint(yPrice),ToFixedPoint(x));
                    this.Canvas.lineTo(ToFixedPoint(y),ToFixedPoint(x));
                }
                else
                {
                    if (this.Direction==1) 
                    {
                        y=top+this.YOffset*pixelTatio;
                        yPrice+=5*pixelTatio;
                    }
                    else 
                    {
                        y=bottom-this.YOffset*pixelTatio;
                        yPrice-=5*pixelTatio;
                    }

                    this.Canvas.moveTo(ToFixedPoint(x),ToFixedPoint(yPrice));
                    this.Canvas.lineTo(ToFixedPoint(x),ToFixedPoint(y));
                }
                this.Canvas.stroke();
                this.Canvas.restore();
            }

            if (isArrayText)
            {
                var text=this.Text[i];
                if (!text) continue;
                this.DrawText(text,x,y,isHScreen);
            }
            else
            {
                //console.log('[ChartSingleText::Draw] ',this.Direction,this.Text)
                this.DrawText(this.Text,x,y,isHScreen);
            }
        }
    }

    this.DrawText=function(text,x,y,isHScreen)
    {
        if (isHScreen)
        {
            this.Canvas.save(); 
            this.Canvas.translate(y, x);
            this.Canvas.rotate(90 * Math.PI / 180);
            this.Canvas.fillText(text,0,0);
            this.Canvas.restore();
        }
        else
        {
            this.Canvas.fillText(text,x,y);
            /*
            var textWidth=this.Canvas.measureText(text).width;
            var rectSize=textWidth*2;
            var xRect,yRect;
            if (this.Direction==1)  yRect=y-rectSize;   //底部
            else if (this.Direction==2) yRect=y;    //顶部
            else yRect=y-rectSize/2; //居中

            if (this.TextAlign=='left') xRect=x;
            else if (this.TextAlign=='right') xRect=x-rectSize;
            else xRect=x-rectSize/2;

            this.Canvas.fillStyle=this.Color;
            this.Canvas.fillRect(xRect,yRect,rectSize,rectSize);

            this.Canvas.fillStyle='rgb(255,255,255)';
            this.Canvas.fillText(text,x,y);
            */
            
        }
    }
}

//直线 水平直线 只有1个数据
function ChartStraightLine()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Color="rgb(255,193,37)";   //线段颜色

    this.Draw=function()
    {
        if (!this.Data || !this.Data.Data) return;
        if (this.Data.Data.length!=1) return;

        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var chartright=this.ChartBorder.GetRight();
        var xPointCount=this.ChartFrame.XPointCount;

        var yValue=this.Data.Data[0];
        var y=this.ChartFrame.GetYFromData(yValue);
        var xLeft=this.ChartFrame.GetXFromIndex(0);
        var xRight=this.ChartFrame.GetXFromIndex(xPointCount-1);

        var yFix=parseInt(y.toString())+0.5;
        this.Canvas.beginPath();
        this.Canvas.moveTo(xLeft,yFix);
        this.Canvas.lineTo(xRight,yFix);
        this.Canvas.strokeStyle=this.Color;
        this.Canvas.stroke();
    }

    this.GetMaxMin=function()
    {
        var xPointCount=this.ChartFrame.XPointCount;
        var range={};
        range.Min=null;
        range.Max=null;

        if (!this.Data || !this.Data.Data) return range;
        if (this.Data.Data.length!=1) return range;

        range.Min=this.Data.Data[0];
        range.Max=this.Data.Data[0];

        return range;
    }
}

/*  
    水平面积 只有1个数据
    Data 数据结构 
    Value, Value2  区间最大最小值
    Color=面积的颜色
    Title=标题 TitleColor=标题颜色
    支持横屏
*/
function ChartStraightArea() 
{
    this.newMethod = IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Color = "rgb(255,193,37)";   //线段颜色
    this.Font ='11px 微软雅黑';

    this.Draw = function () 
    {
        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        if (!this.Data || !this.Data.Data) return;

        if (this.ChartFrame.IsHScreen===true)
        {
            this.HScreenDraw();
            return;
        }

        var dataWidth = this.ChartFrame.DataWidth;
        var distanceWidth = this.ChartFrame.DistanceWidth;
        var chartright = this.ChartBorder.GetRight();
        var bottom = this.ChartBorder.GetBottom();
        var left = this.ChartBorder.GetLeft();
        var xPointCount = this.ChartFrame.XPointCount;

        var xRight = this.ChartFrame.GetXFromIndex(xPointCount - 1);

        for(let i in this.Data.Data)
        {
            let item=this.Data.Data[i];
            if (item==null || isNaN(item.Value) || isNaN(item.Value2)) continue;
            if (item.Color==null) continue;

            let valueMax=Math.max(item.Value,item.Value2);
            let valueMin=Math.min(item.Value,item.Value2);

            var yTop=this.ChartFrame.GetYFromData(valueMax);
            var yBottom=this.ChartFrame.GetYFromData(valueMin);

            this.Canvas.fillStyle = item.Color;
            this.Canvas.fillRect(ToFixedRect(left), ToFixedRect(yTop), ToFixedRect(xRight - left), ToFixedRect(yBottom - yTop));

            if(item.Title && item.TitleColor)
            {
              this.Canvas.textAlign = 'right';
              this.Canvas.textBaseline = 'middle';
              this.Canvas.fillStyle = item.TitleColor;
              this.Canvas.font = this.Font;
              let y = yTop + (yBottom - yTop)/2;
              this.Canvas.fillText(item.Title, xRight, y);
            }
        }
    }

    this.HScreenDraw=function()
    {
        var bottom = this.ChartBorder.GetBottom();
        var top=this.ChartBorder.GetTop();
        var height=this.ChartBorder.GetHeight();

        for(let i in this.Data.Data)
        {
            let item=this.Data.Data[i];
            if (item==null || isNaN(item.Value) || isNaN(item.Value2)) continue;
            if (item.Color==null) continue;

            let valueMax=Math.max(item.Value,item.Value2);
            let valueMin=Math.min(item.Value,item.Value2);

            var yTop=this.ChartFrame.GetYFromData(valueMax);
            var yBottom=this.ChartFrame.GetYFromData(valueMin);

            this.Canvas.fillStyle = item.Color;
            this.Canvas.fillRect(ToFixedRect(yBottom), ToFixedRect(top), ToFixedRect(yTop-yBottom),ToFixedRect(height));

            if(item.Title && item.TitleColor)
            {
                var xText=yTop + (yBottom - yTop)/2;
                var yText=bottom;
                this.Canvas.save(); 
                this.Canvas.translate(xText, yText);
                this.Canvas.rotate(90 * Math.PI / 180);

                this.Canvas.textAlign = 'right';
                this.Canvas.textBaseline = 'middle';
                this.Canvas.fillStyle = item.TitleColor;
                this.Canvas.font = this.Font;
                this.Canvas.fillText(item.Title, 0, -2);

                this.Canvas.restore();
            }
        }
    }

    this.GetMaxMin=function()
    {
        var xPointCount=this.ChartFrame.XPointCount;
        var range={};
        range.Min=null;
        range.Max=null;

        if (!this.Data || !this.Data.Data) return range;
        
        for (let i in this.Data.Data)
        {
          let item = this.Data.Data[i];
            if (item==null || isNaN(item.Value) || isNaN(item.Value2)) continue;

            let valueMax=Math.max(item.Value,item.Value2);
            let valueMin=Math.min(item.Value,item.Value2);

            if (range.Max==null) range.Max=valueMax;
            if (range.Min==null) range.Min=valueMin;

            if (range.Max<valueMax) range.Max=valueMax;
            if (range.Min>valueMin) range.Min=valueMin;
        }

        return range;
    }
}

//分钟线 支持横屏
function ChartMinutePriceLine()
{
    this.newMethod=ChartLine;   //派生
    this.newMethod();
    delete this.newMethod;

    this.YClose;
    this.IsDrawArea=true;    //是否画价格面积图
    this.AreaColor='rgba(0,191,255,0.1)';

    this.Draw=function()
    {
        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var chartright=this.ChartBorder.GetRight();
        if (isHScreen===true) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;
        var minuteCount=this.ChartFrame.MinuteCount;
        var bottom=this.ChartBorder.GetBottomEx();
        var left=this.ChartBorder.GetLeftEx();

        var bFirstPoint=true;
        var ptFirst={}; //第1个点
        var drawCount=0;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (value==null) continue;

            var x=this.ChartFrame.GetXFromIndex(j);
            var y=this.ChartFrame.GetYFromData(value);

            if (bFirstPoint)
            {
                this.Canvas.strokeStyle=this.Color;
                this.Canvas.beginPath();
                if (isHScreen) this.Canvas.moveTo(y,x);
                else this.Canvas.moveTo(x,y);
                bFirstPoint=false;
                ptFirst={X:x,Y:y};
            }
            else
            {
                if (isHScreen) this.Canvas.lineTo(y,x);
                else this.Canvas.lineTo(x,y);
            }

            ++drawCount;

            if (drawCount>=minuteCount) //上一天的数据和这天地数据线段要断开
            {
                bFirstPoint=true;
                this.Canvas.stroke();
                if (this.IsDrawArea)   //画面积
                {
                    if (isHScreen)
                    {
                        this.Canvas.lineTo(left,x);
                        this.Canvas.lineTo(left,ptFirst.X);
                    }
                    else
                    {
                        this.Canvas.lineTo(x,bottom);
                        this.Canvas.lineTo(ptFirst.X,bottom);
                    }
                    this.Canvas.fillStyle=this.AreaColor;
                    this.Canvas.fill();
                }
                drawCount=0;
            }
        }

        if (drawCount>0)
        {
            this.Canvas.stroke();
            if (this.IsDrawArea)   //画面积
            {
                if (isHScreen)
                {
                    this.Canvas.lineTo(left,x);
                    this.Canvas.lineTo(left,ptFirst.X);
                }
                else
                {
                    this.Canvas.lineTo(x,bottom);
                    this.Canvas.lineTo(ptFirst.X,bottom);
                }
                this.Canvas.fillStyle=this.AreaColor;
                this.Canvas.fill();
            }
        }
    }

    this.GetMaxMin=function()
    {
        var xPointCount=this.ChartFrame.XPointCount;
        var range={};
        if (this.YClose==null) return range;

        range.Min=this.YClose;
        range.Max=this.YClose;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (value==null) continue;

            if (range.Max==null) range.Max=value;
            if (range.Min==null) range.Min=value;

            if (range.Max<value) range.Max=value;
            if (range.Min>value) range.Min=value;
        }

        if (range.Max==this.YClose && range.Min==this.YClose)
        {
            range.Max=this.YClose+this.YClose*0.1;
            range.Min=this.YClose-this.YClose*0.1;
            return range;
        }

        var distance=Math.max(Math.abs(this.YClose-range.Max),Math.abs(this.YClose-range.Min));
        range.Max=this.YClose+distance;
        range.Min=this.YClose-distance;

        return range;
    }
}

//分钟线叠加 支持横屏
function ChartOverlayMinutePriceLine()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Color="rgb(65,105,225)";
    this.MainData;                  //主图数据
    this.MainYClose;                //主图股票的前收盘价

    this.Name="ChartOverlayMinutePriceLine";
    this.Title;
    this.Symbol;                    //叠加的股票代码
    this.YClose;                    //叠加的股票前收盘

    this.Draw=function()
    {
        if (!this.Data) return;
        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var chartright=this.ChartBorder.GetRight();
        if (isHScreen===true) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;
        var minuteCount=this.ChartFrame.MinuteCount;

        var bFirstPoint=true;
        var drawCount=0;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i].Close;
            if (value==null) continue;
            var showValue=value/this.YClose*this.MainYClose;

            var x=this.ChartFrame.GetXFromIndex(j);
            var y=this.ChartFrame.GetYFromData(showValue);

            if (bFirstPoint)
            {
                this.Canvas.strokeStyle=this.Color;
                this.Canvas.beginPath();
                if (isHScreen) this.Canvas.moveTo(y,x);
                else this.Canvas.moveTo(x,y);
                bFirstPoint=false;
            }
            else
            {
                if (isHScreen) this.Canvas.lineTo(y,x);
                else this.Canvas.lineTo(x,y);
            }

            ++drawCount;

            if (drawCount>=minuteCount) //上一天的数据和这天地数据线段要断开
            {
                bFirstPoint=true;
                this.Canvas.stroke();
                drawCount=0;
            }
        }

        if (drawCount>0) this.Canvas.stroke();
    }

    this.GetMaxMin=function()
    {
        var xPointCount=this.ChartFrame.XPointCount;
        var range={};
        if (this.YClose==null) return range;

        range.Min=this.MainYClose;
        range.Max=this.MainYClose;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i].Close;
            if (value==null) continue;
            var value=value/this.YClose*this.MainYClose;
            if (range.Max==null) range.Max=value;
            if (range.Min==null) range.Min=value;

            if (range.Max<value) range.Max=value;
            if (range.Min>value) range.Min=value;
        }

        if (range.Max==this.MainYClose && range.Min==this.MainYClose)
        {
            range.Max=this.MainYClose+this.MainYClose*0.1;
            range.Min=this.MainYClose-this.MainYClose*0.1;
            return range;
        }

        var distance=Math.max(Math.abs(this.MainYClose-range.Max),Math.abs(this.MainYClose-range.Min));
        range.Max=this.MainYClose+distance;
        range.Min=this.MainYClose-distance;

        return range;
    }
}

//MACD森林线 支持横屏
function ChartMACD()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.UpColor=g_JSChartResource.UpBarColor;
    this.DownColor=g_JSChartResource.DownBarColor;

    this.Draw=function()
    {
        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        if (this.ChartFrame.IsHScreen===true)
        {
            this.HScreenDraw();
            return;
        }

        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var chartright=this.ChartBorder.GetRight();
        var xPointCount=this.ChartFrame.XPointCount;

        var bFirstPoint=true;
        var drawCount=0;
        var yBottom=this.ChartFrame.GetYFromData(0);
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (value==null) continue;

            var x=this.ChartFrame.GetXFromIndex(j);
            var y=this.ChartFrame.GetYFromData(value);

            if (x>chartright) break;

            var xFix=parseInt(x.toString())+0.5;    //毛边修正
            this.Canvas.beginPath();
            this.Canvas.moveTo(xFix,yBottom);
            this.Canvas.lineTo(xFix,y);

            if (value>=0) this.Canvas.strokeStyle=this.UpColor;
            else this.Canvas.strokeStyle=this.DownColor;
            this.Canvas.stroke();
            this.Canvas.closePath();
        }
    }

    this.HScreenDraw=function()
    {
        var chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;

        var yBottom=this.ChartFrame.GetYFromData(0);
        
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (value==null) continue;

            var x=this.ChartFrame.GetXFromIndex(j);
            var y=this.ChartFrame.GetYFromData(value);

            if (x>chartright) break;

            this.Canvas.beginPath();
            this.Canvas.moveTo(yBottom,ToFixedPoint(x));
            this.Canvas.lineTo(y,ToFixedPoint(x));

            if (value>=0) this.Canvas.strokeStyle=this.UpColor;
            else this.Canvas.strokeStyle=this.DownColor;
            this.Canvas.stroke();
            this.Canvas.closePath();
        }
    }
}

//柱子
function ChartBar()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.UpBarColor=g_JSChartResource.UpBarColor;
    this.DownBarColor=g_JSChartResource.DownBarColor;

    this.Draw=function()
    {
        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var chartright=this.ChartBorder.GetRight();
        var xPointCount=this.ChartFrame.XPointCount;
        var xOffset=this.ChartBorder.GetLeft()+distanceWidth/2.0+2.0;

        var bFirstPoint=true;
        var drawCount=0;
        var yBottom=this.ChartFrame.GetYFromData(0);
        if (dataWidth>=4)
        {
            yBottom=ToFixedRect(yBottom);   //调整为整数
            for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
            {
                var value=this.Data.Data[i];
                if (value==null || value==0) continue;

                var left=xOffset;
                var right=xOffset+dataWidth;
                if (right>chartright) break;

                var x=this.ChartFrame.GetXFromIndex(j);
                var y=this.ChartFrame.GetYFromData(value);


                if (value>0) this.Canvas.fillStyle=this.UpBarColor;
                else this.Canvas.fillStyle=this.DownBarColor;

                //高度调整为整数
                var height=ToFixedRect(Math.abs(yBottom-y));
                if(yBottom-y>0) y=yBottom-height;
                else y=yBottom+height;
                this.Canvas.fillRect(ToFixedRect(left),y,ToFixedRect(dataWidth),height);
            }
        }
        else    //太细了 直接画柱子
        {
            for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
            {
                var value=this.Data.Data[i];
                if (value==null || value==0) continue;

                var left=xOffset;
                var right=xOffset+dataWidth;
                if (right>chartright) break;

                var x=this.ChartFrame.GetXFromIndex(j);
                var y=this.ChartFrame.GetYFromData(value);

                if (value>0) this.Canvas.strokeStyle=this.UpBarColor;
                else this.Canvas.strokeStyle=this.DownBarColor;

                this.Canvas.beginPath();
                this.Canvas.moveTo(ToFixedPoint(x),y);
                this.Canvas.lineTo(ToFixedPoint(x),yBottom);
                this.Canvas.stroke();
            }
        }
    }

    this.GetMaxMin=function()
    {
        var xPointCount=this.ChartFrame.XPointCount;
        var range={};
        range.Min=0;
        range.Max=null;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (range.Max==null) range.Max=value;
            if (range.Max<value) range.Max=value;
        }

        return range;
    }
}
// 面积图
function ChartBand()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;
    this.IsDrawFirst = true;

    this.FirstColor = g_JSChartResource.Index.LineColor[0];
    this.SecondColor = g_JSChartResource.Index.LineColor[1];

    this.Draw=function()
    {
        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var xPointCount=this.ChartFrame.XPointCount;
        var xOffset=this.ChartBorder.GetLeft()+distanceWidth/2.0+2.0;
        var x = 0;
        var y = 0;
        var y2 = 0;
        var firstlinePoints = [];
        var secondlinePoints = [];
        var lIndex = 0;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
        {
            var value=this.Data.Data[i];
            if (value==null || value.Value==null || value.Value2 == null) continue;
            x=this.ChartFrame.GetXFromIndex(j);
            y=this.ChartFrame.GetYFromData(value.Value);
            y2 = this.ChartFrame.GetYFromData(value.Value2);
            firstlinePoints[lIndex] = {x:x,y:y};
            secondlinePoints[lIndex] = {x:x,y:y2};
            lIndex++;
        }
        if (firstlinePoints.length > 1)
        {
            this.Canvas.save();
            this.Canvas.beginPath();
            for (var i = 0; i < firstlinePoints.length; ++i)
            {
                if (i == 0)
                    this.Canvas.moveTo(firstlinePoints[i].x, firstlinePoints[i].y);
                else
                    this.Canvas.lineTo(firstlinePoints[i].x, firstlinePoints[i].y);
            }  
            for (var j = secondlinePoints.length-1; j >= 0; --j)
            {
                this.Canvas.lineTo(secondlinePoints[j].x, secondlinePoints[j].y);
            }  
            this.Canvas.closePath();
            this.Canvas.clip();
            this.Canvas.beginPath();
            this.Canvas.moveTo(firstlinePoints[0].x, this.ChartBorder.GetBottom());
            for (var i = 0; i < firstlinePoints.length; ++i)
            {
                this.Canvas.lineTo(firstlinePoints[i].x, firstlinePoints[i].y);
            }
            this.Canvas.lineTo(firstlinePoints[firstlinePoints.length-1].x, this.ChartBorder.GetBottom());
            this.Canvas.closePath();
            this.Canvas.fillStyle = this.FirstColor;
            this.Canvas.fill();
            this.Canvas.beginPath();
            this.Canvas.moveTo(secondlinePoints[0].x, this.ChartBorder.GetBottom());
            for (var i = 0; i < secondlinePoints.length; ++i)
            {
                this.Canvas.lineTo(secondlinePoints[i].x, secondlinePoints[i].y);
            }
            this.Canvas.lineTo(secondlinePoints[secondlinePoints.length-1].x, this.ChartBorder.GetBottom());
            this.Canvas.closePath();
            this.Canvas.fillStyle = this.SecondColor;
            this.Canvas.fill();
            this.Canvas.restore();
        }
    }
    this.GetMaxMin=function()
    {
        var xPointCount=this.ChartFrame.XPointCount;
        var range={};
        range.Min=null;
        range.Max=null;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (value==null || value.Value==null || value.Value2 == null) continue;
            var maxData = value.Value>value.Value2?value.Value:value.Value2;
            var minData = value.Value<value.Value2?value.Value:value.Value2;
            if (range.Max==null) 
                range.Max = maxData;
            else if (range.Max < maxData)
                range.Max = maxData;
            
            if (range.Min==null)
                range.Min = minData;
            else if (range.Min > minData)
                range.Min = minData; 
        }

        return range;
    }
}

//锁  支持横屏
function ChartLock()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;
    this.WidthDiv = 0.2;  // 框子宽度占比
    this.LockCount = 20; // 锁最新的几个数据
    this.BGColor = g_JSChartResource.LockBGColor;
    this.TextColor = g_JSChartResource.LockTextColor;
    this.Font = g_JSChartResource.DefaultTextFont;
    this.Title = '🔒开通权限';
    this.LockRect=null; //上锁区域
    this.LockID;        //锁ID
    this.Callback;      //回调
    this.IndexName;     //指标名字

    this.Draw=function()
    {
        this.LockRect=null;
        if (this.NotSupportMessage)
        {
            this.DrawNotSupportmessage();
            return;
        }

        if (this.ChartFrame.IsHScreen===true)
        {
            this.HScreenDraw();
            return;
        }

        var xOffset = this.ChartBorder.GetRight();
        var lOffsetWidth = 0;
        if (this.ChartFrame.Data != null)
        {
            var dataWidth=this.ChartFrame.DataWidth;
            var distanceWidth=this.ChartFrame.DistanceWidth;
            xOffset=this.ChartBorder.GetLeft()+distanceWidth/2.0+2.0;
            var chartright=this.ChartBorder.GetRight();
            var xPointCount=this.ChartFrame.XPointCount;
            for(var i=this.ChartFrame.Data.DataOffset,j=0;i<this.ChartFrame.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
            {
                var data=this.ChartFrame.Data.Data[i];
                if (data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;

                var left=xOffset;
                var right=xOffset+dataWidth;
                if (right>chartright) break;
            }
            lOffsetWidth = (dataWidth + distanceWidth) * this.LockCount;    
        }
        if (lOffsetWidth == 0)
        {
            lOffsetWidth = (xOffset - this.ChartBorder.GetLeft()) * this.WidthDiv;
        }
        var lLeft = xOffset - lOffsetWidth;
        if (lLeft < this.ChartBorder.GetLeft())
            lLeft = this.ChartBorder.GetLeft();
        var lHeight = this.ChartBorder.GetBottom() - this.ChartBorder.GetTop();
        var lWidth = this.ChartBorder.GetRight() - lLeft;
        this.Canvas.fillStyle = this.BGColor;
        this.Canvas.fillRect(lLeft, this.ChartBorder.GetTop(), lWidth, lHeight);
        var xCenter = lLeft + lWidth / 2;
        var yCenter = this.ChartBorder.GetTop() + lHeight / 2;
        this.Canvas.textAlign = 'center';
        this.Canvas.textBaseline = 'middle';
        this.Canvas.fillStyle = this.TextColor;
        this.Canvas.font = this.Font;
        this.Canvas.fillText(this.Title, xCenter, yCenter);

        this.LockRect={Left:lLeft,Top:this.ChartBorder.GetTop(),Width:lWidth,Heigh:lHeight};    //保存上锁区域
    }

    this.HScreenDraw=function()
    {
        var xOffset = this.ChartBorder.GetBottom();

        var lOffsetWidth = 0;
        if (this.ChartFrame.Data != null)
        {
            var dataWidth=this.ChartFrame.DataWidth;
            var distanceWidth=this.ChartFrame.DistanceWidth;
            xOffset=this.ChartBorder.GetTop()+distanceWidth/2.0+2.0;
            var chartright=this.ChartBorder.GetBottom();
            var xPointCount=this.ChartFrame.XPointCount;
            //求最后1个数据的位置
            for(var i=this.ChartFrame.Data.DataOffset,j=0;i<this.ChartFrame.Data.Data.length && j<xPointCount;++i,++j,xOffset+=(dataWidth+distanceWidth))
            {
                var data=this.ChartFrame.Data.Data[i];
                if (data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;

                var left=xOffset;
                var right=xOffset+dataWidth;
                if (right>chartright) break;
            }
            lOffsetWidth = (dataWidth + distanceWidth) * this.LockCount;    
        }
        if (lOffsetWidth == 0)
        {
            lOffsetWidth = (xOffset - this.ChartBorder.GetTop()) * this.WidthDiv;
        }

        var lLeft = xOffset - lOffsetWidth;
        if (lLeft < this.ChartBorder.GetTop()) lLeft = this.ChartBorder.GetTop();
        var lHeight =  this.ChartBorder.GetRight()-this.ChartBorder.GetLeft();
        var lWidth = this.ChartBorder.GetBottom() - lLeft;
        this.Canvas.fillStyle = this.BGColor;
        this.Canvas.fillRect(this.ChartBorder.GetLeft(), lLeft,lHeight,lWidth);

        var xCenter = this.ChartBorder.GetLeft() + lHeight / 2;
        var yCenter = lLeft + lWidth / 2;
        this.Canvas.save(); 
        this.Canvas.translate(xCenter, yCenter);
        this.Canvas.rotate(90 * Math.PI / 180);
        this.Canvas.textAlign = 'center';
        this.Canvas.textBaseline = 'middle';
        this.Canvas.fillStyle = this.TextColor;
        this.Canvas.font = this.Font;
        this.Canvas.fillText(this.Title, 0, 0);
        this.Canvas.restore();

        this.LockRect={Left:this.ChartBorder.GetLeft(),Top:lLeft,Width:lHeight,Heigh:lWidth};    //保存上锁区域
    }

    //x,y是否在上锁区域
    this.GetTooltipData=function(x,y,tooltip)
    {
        if (this.LockRect==null) return false;

        this.Canvas.beginPath();
        this.Canvas.rect(this.LockRect.Left,this.LockRect.Top,this.LockRect.Width,this.LockRect.Heigh);
        if (this.Canvas.isPointInPath(x,y))
        {
            tooltip.Data={ ID:this.LockID, Callback:this.Callback, IndexName:this.IndexName };
            tooltip.ChartPaint=this;
            return true;
        }
        
        return false;
    }
}

//买卖盘
function ChartBuySell()
{
    this.newMethod=ChartSingleText;   //派生
    this.newMethod();
    delete this.newMethod;

    this.TextFont=g_JSChartResource.KLineTrain.Font;                //"bold 14px arial";           //买卖信息字体
    this.LastDataIcon=g_JSChartResource.KLineTrain.LastDataIcon; //{Color:'rgb(0,0,205)',Text:'↓'};
    this.BuyIcon=g_JSChartResource.KLineTrain.BuyIcon; //{Color:'rgb(0,0,205)',Text:'B'};
    this.SellIcon=g_JSChartResource.KLineTrain.SellIcon; //{Color:'rgb(0,0,205)',Text:'S'};
    this.BuySellData=new Map();   //{Date:日期, Op:买/卖 0=buy 1=sell}
    this.LastData={}; //当前屏最后一个数据
    this.IconFont=g_JSChartResource.KLineTrain.IconFont;

    this.Draw=function()
    {
        if (!this.Data || !this.Data.Data) return;

        var isHScreen=(this.ChartFrame.IsHScreen===true);
        var dataWidth=this.ChartFrame.DataWidth;
        var distanceWidth=this.ChartFrame.DistanceWidth;
        var chartright=this.ChartBorder.GetRight();
        if (isHScreen===true) chartright=this.ChartBorder.GetBottom();
        var xPointCount=this.ChartFrame.XPointCount;

        if (this.IconFont)
        {
            var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
            var iconSize=dataWidth+distanceWidth;
            var minIconSize=18*pixelTatio;
            if (iconSize<minIconSize) iconSize=minIconSize;
            this.Canvas.font=iconSize+'px '+this.IconFont.Family;
        }
        else
        {
            this.Canvas.font=this.TextFont;
        }
        
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var value=this.Data.Data[i];
            if (value==null) continue;
            if (x>chartright) break;

            this.LastData={ID:j,Data:value};

            if (!this.BuySellData.has(value.Date)) continue;
            var bsItem=this.BuySellData.get(value.Date);
            var x=this.ChartFrame.GetXFromIndex(j);
            var yHigh=this.ChartFrame.GetYFromData(value.High);
            var yLow=this.ChartFrame.GetYFromData(value.Low);

            if (bsItem.Op==0)   //买 标识在最低价上
            {
                this.Canvas.textAlign='center';
                this.Canvas.textBaseline='top';
                if (this.IconFont)
                {
                    this.Canvas.fillStyle=this.IconFont.Buy.Color
                    this.DrawText(this.IconFont.Buy.Text,x,yLow,isHScreen);
                }
                else
                {
                    this.Canvas.fillStyle=this.BuyIcon.Color;
                    this.DrawText(this.BuyIcon.Text,x,yLow,isHScreen);
                }
            }
            else    //卖 标识在最高价上
            {
                this.Canvas.textAlign='center';
                this.Canvas.textBaseline='bottom';
                if (this.IconFont)
                {
                    this.Canvas.fillStyle=this.IconFont.Sell.Color
                    this.DrawText(this.IconFont.Sell.Text,x,yHigh,isHScreen);
                }
                else
                {
                    this.Canvas.fillStyle=this.SellIcon.Color;
                    this.DrawText(this.SellIcon.Text,x,yHigh,isHScreen);
                }
            }
        }

        //最后一个位置
        var x=this.ChartFrame.GetXFromIndex(this.LastData.ID);
        var yHigh=this.ChartFrame.GetYFromData(this.LastData.Data.High);
        this.Canvas.textAlign='center';
        this.Canvas.textBaseline='bottom';
        if (this.IconFont)
        {
            this.Canvas.fillStyle=this.IconFont.Last.Color
            this.DrawText(this.IconFont.Last.Text,x,yHigh,isHScreen);
        }
        else
        {
            this.Canvas.fillStyle=this.LastDataIcon.Color;
            this.Canvas.font=this.TextFont;
            this.DrawText(this.LastDataIcon.Text,x,yHigh,isHScreen);
        }
    }
}

/*
    饼图
*/
function ChartPie()
{   
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Radius = 100; //半径默认值
    this.Distance = 30; //指示线超出圆饼的距离
    this.txtLine = 20; // 文本下划线
    this.paddingX = 20 / 3;// 设置文本的移动
    
    // return;
    this.Draw=function()
    {
        if (!this.Data || !this.Data.Data || !(this.Data.Data.length>0)) return this.DrawEmptyData();

        let left=this.ChartBorder.GetLeft();
        let right=this.ChartBorder.GetRight();
        let top=this.ChartBorder.GetTop();
        let bottom=this.ChartBorder.GetBottom();
        let width=this.ChartBorder.GetWidth();
        let height=this.ChartBorder.GetHeight();

        if(isNaN(this.Radius)){
            let str = this.Radius.replace("%","");
            str = str/100;
            if(width >= height){
                this.Radius = str*height;
            }
            if(width < height) this.Radius = str*width;
        }


        this.Canvas.translate(width/2,height/2);

        let totalValue=0;   //求和
        for(let i in this.Data.Data)
        {
            totalValue += this.Data.Data[i].Value;
        }
        let start = 0;
        let end = 0;
        //画饼图
        for(let i in this.Data.Data)
        {
            let item =this.Data.Data[i];
            let rate=(item.Value/totalValue).toFixed(2); //占比
            //console.log('[ChartPie::Draw]', i, rate, item);

            // 绘制扇形
            this.Canvas.beginPath();
            this.Canvas.moveTo(0,0);

            end += rate*2*Math.PI;//终止角度
            this.Canvas.strokeStyle = "white";
            this.Canvas.fillStyle = item.Color;
            this.Canvas.arc(0,0,this.Radius,start,end);
            this.Canvas.fill();
            this.Canvas.closePath();
            this.Canvas.stroke();
            
            // 绘制直线
            this.Canvas.beginPath();
            this.Canvas.strokeStyle = item.Color;
            this.Canvas.moveTo(0,0);
            let x = (this.Radius + this.Distance)*Math.cos(end- (end-start)/2);
            let y = (this.Radius + this.Distance)*Math.sin(end - (end-start)/2);
            this.Canvas.lineTo(x,y);
            // console.log(x,y,"xy")
            
            // 绘制横线
            let txtLine = this.txtLine;
            let paddingX = this.paddingX;
            this.Canvas.textAlign = 'left';
            if( end - (end-start)/2 < 1.5*Math.PI && end - (end-start)/2 > 0.5*Math.PI ){
                
                txtLine = - this.txtLine;
                paddingX = - this.paddingX;
                this.Canvas.textAlign = 'right';
            }
            this.Canvas.lineTo( x + txtLine, y );
            this.Canvas.stroke();

             // 写文字
             if(item.Text){
                 this.Canvas.fillText( item.Text, x + txtLine + paddingX, y );
             }else{
                 let text = `${item.Name}:${item.Value}`;
                 this.Canvas.fillText( text, x + txtLine + paddingX, y );
             }
            

            start += rate*2*Math.PI;//起始角度
        }

        


    }

    //空数据
    this.DrawEmptyData=function()
    {
        console.log('[ChartPie::DrawEmptyData]')
    }
}


/*
    雷达图
*/
function ChartRadar()
{
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.BorderPoint=[];    //边框点
    this.DataPoint=[];      //数据点
    this.CenterPoint={};
    this.StartAngle=0;
    this.Color='rgb(198,198,198)';
    this.AreaColor='rgba(242,154,118,0.4)';    //面积图颜色
    this.AreaLineColor='rgb(242,154,118)';
    this.TitleFont=24*GetDevicePixelRatio()+'px 微软雅黑';
    this.TitleColor='rgb(102,102,102)';
    this.BGColor = ['rgb(255,255,255)', 'rgb(224,224,224)']//背景色

    this.DrawBorder=function()  //画边框
    {
        if (this.BorderPoint.length<=0) return;

        this.Canvas.font=this.TitleFont;
        this.Canvas.strokeStyle = this.Color;
        const aryBorder=[1,0.8,0.6,0.4,0.2];
        for (let j in aryBorder)
        {
            var rate = aryBorder[j];
            var isFirstDraw=true;
            for(let i in this.BorderPoint)
            {
                var item=this.BorderPoint[i];
                item.X = this.CenterPoint.X + item.Radius * Math.cos(item.Angle * Math.PI / 180) * rate;
                item.Y = this.CenterPoint.Y + item.Radius * Math.sin(item.Angle * Math.PI / 180) * rate;
                if (isFirstDraw)
                {
                    this.Canvas.beginPath();
                    this.Canvas.moveTo(item.X,item.Y);
                    isFirstDraw=false;
                }
                else
                {
                    this.Canvas.lineTo(item.X,item.Y);
                }
            }

            this.Canvas.closePath();
            this.Canvas.stroke();
            this.Canvas.fillStyle = this.BGColor[j%2==0?0:1];
            this.Canvas.fill();
        }

        this.Canvas.beginPath();
        for(let i in this.BorderPoint)
        {
            var item=this.BorderPoint[i];
            item.X = this.CenterPoint.X + item.Radius * Math.cos(item.Angle * Math.PI / 180);
            item.Y = this.CenterPoint.Y + item.Radius * Math.sin(item.Angle * Math.PI / 180);
            this.Canvas.moveTo(this.CenterPoint.X,this.CenterPoint.Y);
            this.Canvas.lineTo(item.X,item.Y);
            this.DrawText(item);
        }
        this.Canvas.stroke();
    }

    this.DrawArea=function()
    {
        if (!this.DataPoint || this.DataPoint.length<=0) return;

        this.Canvas.fillStyle = this.AreaColor;
        this.Canvas.strokeStyle = this.AreaLineColor;
        this.Canvas.beginPath();
        var isFirstDraw=true;
        for(let i in this.DataPoint)
        {
            var item=this.DataPoint[i];
            if (isFirstDraw)
            {
                this.Canvas.beginPath();
                this.Canvas.moveTo(item.X,item.Y);
                isFirstDraw=false;
            }
            else
            {
                this.Canvas.lineTo(item.X,item.Y);
            }
        }

        this.Canvas.closePath();
        this.Canvas.fill();
        this.Canvas.stroke();
    }

    this.DrawText=function(item)
    {
        if (!item.Text) return;
          
        //console.log(item.Text, item.Angle);
        this.Canvas.fillStyle = this.TitleColor;
        var xText = item.X, yText = item.Y;

        //显示每个角度的位置
        if (item.Angle > 0 && item.Angle < 45) {
            this.Canvas.textAlign = 'left';
            this.Canvas.textBaseline = 'middle';
            xText += 2;
        }
        else if (item.Angle >= 0 && item.Angle < 90) {
            this.Canvas.textAlign = 'left';
            this.Canvas.textBaseline = 'top';
            xText += 2;
        }
        else if (item.Angle >= 90 && item.Angle < 135) {
            this.Canvas.textAlign = 'right';
            this.Canvas.textBaseline = 'top';
            xText -= 2;
        }
        else if (item.Angle >= 135 && item.Angle < 180) {
            this.Canvas.textAlign = 'right';
            this.Canvas.textBaseline = 'top';
            xText -= 2;
        }
        else if (item.Angle >= 180 && item.Angle < 225) {
            this.Canvas.textAlign = 'right';
            this.Canvas.textBaseline = 'middle';
            xText -= 2;
        }
        else if (item.Angle >= 225 && item.Angle <= 270) {
            this.Canvas.textAlign = 'center';
            this.Canvas.textBaseline = 'bottom';
        }
        else if (item.Angle > 270 && item.Angle < 315) {
            this.Canvas.textAlign = 'left';
            this.Canvas.textBaseline = 'bottom';
            xText += 2;
        }
        else {
            this.Canvas.textAlign = 'left';
            this.Canvas.textBaseline = 'middle';
            xText += 2;
        }

        this.Canvas.fillText(item.Text, xText, yText);
    }

    this.Draw=function()
    {
        this.BorderPoint=[];
        this.DataPoint=[];
        this.CenterPoint={};
        if (!this.Data || !this.Data.Data || !(this.Data.Data.length>0))
            this.CalculatePoints(null);
        else 
            this.CalculatePoints(this.Data.Data);

        this.DrawBorder();
        this.DrawArea();
    }

    this.CalculatePoints=function(data)
    {
        let left=this.ChartBorder.GetLeft();
        let right=this.ChartBorder.GetRight();
        let top=this.ChartBorder.GetTop();
        let bottom=this.ChartBorder.GetBottom();
        let width=this.ChartBorder.GetWidth();
        let height=this.ChartBorder.GetHeight();

        let ptCenter={X:left+width/2, Y:top+height/2};  //中心点
        let radius=Math.min(width/2,height/2)-2         //半径
        let count=Math.max(5,data?data.length:0);
        let averageAngle=360/count;
        for(let i=0;i<count;++i)
        {
            let ptBorder = { Index: i, Radius: radius, Angle: i * averageAngle + this.StartAngle };
            let angle = ptBorder.Angle;

            if (data && i<data.length)
            {
                var item=data[i];
                let ptData={Index:i,Text:item.Text};
                ptBorder.Text=item.Name;
                if (!item.Value)
                {
                    ptData.X=ptCenter.X;
                    ptData.Y=ptCenter.Y;
                } 
                else
                {
                    var value=item.Value;
                    if (value>=1) value=1;
                    var dataRadius=radius*value;
                    ptData.X=ptCenter.X+dataRadius*Math.cos(angle*Math.PI/180);
                    ptData.Y=ptCenter.Y+dataRadius*Math.sin(angle*Math.PI/180);
                }

                this.DataPoint.push(ptData);
            }

            this.BorderPoint.push(ptBorder);
        }

        this.CenterPoint=ptCenter;
    }

    //空数据
    this.DrawEmptyData=function()
    {
        console.log('[ChartPie::DrawEmptyData]')
    }
}

/*
    中国地图
*/


function ChartChinaMap()
{   
    this.newMethod=IChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ImageData=null;
    this.Left;
    this.Top;
    this.Width;
    this.Height;
    this.ImageWidth;
    this.ImageHeight;

    this.DefaultColor=[217,222,239];

    this.Color=
    [
        {Name:'海南',       Color:'rgb(217,222,223)'},
        {Name:'内蒙古',     Color:'rgb(217,222,225)'},
        {Name:'新疆',       Color:'rgb(217,222,226)'},
        {Name:'青海',       Color:'rgb(217,222,227)'},
        {Name:'西藏',       Color:'rgb(217,222,228)'},
        {Name:'云南',       Color:'rgb(217,222,229)'},
        {Name:'黑龙江',     Color:'rgb(217,222,230)'},
        {Name:'吉林',       Color:'rgb(217,222,231)'},
        {Name:'辽宁',       Color:'rgb(217,222,232)'},
        {Name:'河北',       Color:'rgb(217,222,233)'},
        {Name:'山东',       Color:'rgb(217,222,234)'},
        {Name:'江苏',       Color:'rgb(217,222,235)'},
        {Name:'浙江',       Color:'rgb(217,222,236)'},
        {Name:'福建',       Color:'rgb(217,222,237)'},
        {Name:'广东',       Color:'rgb(217,222,238)'},
        {Name:'广西',       Color:'rgb(217,222,239)'},
        {Name:'贵州',       Color:'rgb(217,222,240)'},
        {Name:'湖南',       Color:'rgb(217,222,241)'},
        {Name:'江西',       Color:'rgb(217,222,242)'},
        {Name:'安徽',       Color:'rgb(217,222,243)'},
        {Name:'湖北',       Color:'rgb(217,222,244)'},
        {Name:'重庆',       Color:'rgb(217,222,245)'},
        {Name:'四川',       Color:'rgb(217,222,246)'},
        {Name:'甘肃',       Color:'rgb(217,222,247)'},
        {Name:'陕西',       Color:'rgb(217,222,248)'},
        {Name:'山西',       Color:'rgb(217,222,249)'},
        {Name:'河南',       Color:'rgb(217,222,250)'}
    ];

    this.Draw=function()
    {
        let left=this.ChartBorder.GetLeft()+1;
        let right=this.ChartBorder.GetRight()-1;
        let top=this.ChartBorder.GetTop()+1;
        let bottom=this.ChartBorder.GetBottom()-1;
        let width=this.ChartBorder.GetWidth()-2;
        let height=this.ChartBorder.GetHeight()-2;

        let imageWidth=CHINA_MAP_IMAGE.width;
        let imageHeight=CHINA_MAP_IMAGE.height;

        let drawImageWidth=imageWidth;
        let drawImageHeight=imageHeight;

        if (height<drawImageHeight || width<drawImageWidth) 
        {
            this.ImageData=null;
            return;
        }

        if (this.Left!=left || this.Top!=top || this.Width!=width || this.Height!=height || this.ImageWidth!=imageWidth || this.ImageHeight!=imageHeight)
        {
            this.ImageData=null;

            this.ImageWidth=imageWidth;
            this.ImageHeight=imageHeight;
            this.Left=left;
            this.Top=top;
            this.Width=width;
            this.Height=height;

            console.log(imageWidth,imageHeight);
        }
        
        if (this.ImageData==null)
        {
            this.Canvas.drawImage(CHINA_MAP_IMAGE,0,0,imageWidth,imageHeight,left,top,drawImageWidth,drawImageHeight);
            this.ImageData=this.Canvas.getImageData(left,top,drawImageWidth,drawImageHeight);

            let defaultColorSet=new Set();  //默认颜色填充的色块
            let colorMap=new Map();         //定义颜色填充的色块

            let nameMap=new Map();
            if (this.Data.length>0)
            {
                for(let i in this.Data)
                {
                    let item=this.Data[i];
                    nameMap.set(item.Name,item.Color)
                }
            }

            console.log(this.Data);
            for(let i in this.Color)
            {
                let item=this.Color[i];
                if (nameMap.has(item.Name))
                {
                    colorMap.set(item.Color,nameMap.get(item.Name));
                }
                else
                {
                    defaultColorSet.add(item.Color);
                }
            }

            var color;
            for (let i=0;i<this.ImageData.data.length;i+=4)
            {
                color='rgb('+ this.ImageData.data[i] + ',' + this.ImageData.data[i+1] + ',' + this.ImageData.data[i+2] + ')';

                if (defaultColorSet.has(color))
                {
                    this.ImageData.data[i]=this.DefaultColor[0];
                    this.ImageData.data[i+1]=this.DefaultColor[1];
                    this.ImageData.data[i+2]=this.DefaultColor[2];
                }
                else if (colorMap.has(color))
                {
                    let colorValue=colorMap.get(color);
                    this.ImageData.data[i]=colorValue[0];
                    this.ImageData.data[i+1]=colorValue[1];
                    this.ImageData.data[i+2]=colorValue[2];
                }
            }
            this.Canvas.clearRect(left,top,drawImageWidth,drawImageHeight);
            this.Canvas.putImageData(this.ImageData,left,top,0,0,drawImageWidth,drawImageHeight);
        }
        else
        {
            this.Canvas.putImageData(this.ImageData,left,top,0,0,drawImageWidth,drawImageHeight);
        }
    }
}

/*
    扩展图形
*/

function IExtendChartPainting()
{
    this.Canvas;                        //画布
    this.ChartBorder;                   //边框信息
    this.ChartFrame;                    //框架画法
    this.Name;                          //名称
    this.Data;                          //数据区
    this.IsDynamic=false;
    this.ClassName='IExtendChartPainting';
    this.SizeChange=true;               //大小是否改变

    //上下左右间距
    this.Left=5;
    this.Right=5;
    this.Top=5;
    this.Bottom=5;

    this.Draw=function()
    {

    }

    //设置参数接口
    this.SetOption=function(option)
    {

    }

}

function StockInfoExtendChartPaint()
{
    this.newMethod=IExtendChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Left=80;
    this.Right=1;
    this.Top=1;
    this.Bottom=1;

    this.BorderColor=g_JSChartResource.FrameBorderPen;

    this.Symbol;
    this.Name;

    this.TitleFont=["14px 微软雅黑"];

    this.Draw=function()
    {
        var left=this.ChartBorder.GetRight()+this.Left;
        var right=this.ChartBorder.GetChartWidth()-this.Right;
        var y=this.Top+18;
        var middle=left+(right-left)/2;

        if (this.Symbol && this.Name)
        {
            this.Canvas.font=this.TitleFont[0];

            this.Canvas.textAlign="right";
            this.Canvas.textBaseline="bottom";
            this.Canvas.fillText(this.Symbol,middle-2,y);

            this.Canvas.textAlign="left";
            this.Canvas.fillText(this.Name,middle+2,y);
        }
        ;
        this.Canvas.strokeStyle=this.BorderColor;
        this.Canvas.moveTo(left,y);
        this.Canvas.lineTo(right,y);
        this.Canvas.stroke();

        y+=30;

        this.DrawBorder();
    }

    this.DrawBorder=function()
    {
        var left=this.ChartBorder.GetRight()+this.Left;
        var right=this.ChartBorder.GetChartWidth()-this.Right;
        var top=this.Top;
        var bottom=this.ChartBorder.GetChartHeight()-this.Bottom;

        this.Canvas.strokeStyle=this.BorderColor;
        this.Canvas.strokeRect(left,top,(right-left),(bottom-top));
    }
}

//筹码分布
function StockChip()
{
    this.newMethod=IExtendChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Name='筹码分布';
    this.ClassName='StockChip';

    this.HQChart;
    this.PenBorder=g_JSChartResource.FrameBorderPen;    //边框
    this.ColorProfit='rgb(255,0,0)';            //盈利的线段
    this.ColorNoProfit='rgb(90,141,248)';       //非盈利
    this.ColorAveragePrice='rgb(0,139,0)';   //平均价线
    this.ColorBG='rgb(190,190,190)';           //筹码背景线段颜色

    this.ShowType=0;    //0=所有筹码  1=周期前  2=周期内
    this.IsDynamic=true;
    this.ClientRect={};
    this.Font=g_JSChartResource.TitleFont;
    this.InfoColor='rgb(0,0,0)';
    this.DayInfoColor='rgb(255,255,255)';
    this.LineHeight=16;
    this.Left=50;   //左边间距
    this.IsAutoIndent=0;

    this.ButtonID=Guid();  //工具条Div id

    this.DAY_COLOR=
    [
        ['rgb(255,0,0)','rgb(255,128,128)','rgb(255,0,128)','rgb(255,100,0)','rgb(192,128,0)','rgb(255,192,0)'],
        ['rgb(120,80,225)','rgb(160,160,225)','rgb(80,80,255)','rgb(120,120,255)','rgb(32,64,192)','rgb(0,64,128)'],
    ];

    this.SetOption=function(option)
    {
        if (!option) return;
        if (option.ShowType>0) this.ShowType=option.ShowType;
        if (option.IsAutoIndent>0) this.IsAutoIndent=option.IsAutoIndent;    //是否自动缩进
    }
    
    this.Draw=function()
    {
        var left=ToFixedPoint(this.ChartBorder.GetRight()+this.Left);
        var top=ToFixedPoint(this.ChartBorder.GetTop());
        var right=ToFixedPoint(this.ChartBorder.GetChartWidth()-1);
        var bottom=ToFixedPoint(this.ChartBorder.GetBottom());
        var width=right-left;
        var height=bottom-top;
        this.ClientRect={Left:left,Top:top,Width:width,Height:height};

        if (this.CalculateChip())
        {
            this.DrawAllChip();
            if (this.ShowType==1|| this.ShowType==2) this.DrawDayChip();

            this.CalculateCast();   //计算成本  
            this.DrawChipInfo();      
        }
        else
        {
            console.log('[StockChip::Draw] no data');
        }

        this.DrawBorder();
        if (this.SizeChange==true) this.DrawButton();

        this.SizeChange=false;
    }

    this.DrawChipInfo=function()    
    {
        var bottom=ToFixedPoint(this.ChartBorder.GetBottom())-1;
        var left=ToFixedPoint(this.ChartBorder.GetRight()+this.Left)+2;
        var right=ToFixedPoint(this.ChartBorder.GetChartWidth()-1);

        this.Canvas.font=this.Font;
        this.Canvas.fillStyle=this.InfoColor;
        this.Canvas.textBaseline='bottom';
        this.Canvas.textAlign='left';

        var text='70%成本价'+ this.Data.Cast[1].MinPrice.toFixed(2)+'-'+this.Data.Cast[1].MaxPrice.toFixed(2)+'集中'+this.Data.Cast[1].Rate.toFixed(2)+'%';
        this.Canvas.fillText(text,left,bottom);
        bottom-=this.LineHeight;

        text='90%成本价'+ this.Data.Cast[0].MinPrice.toFixed(2)+'-'+this.Data.Cast[0].MaxPrice.toFixed(2)+'集中'+this.Data.Cast[0].Rate.toFixed(2)+'%';;
        this.Canvas.fillText(text,left,bottom);
        bottom-=this.LineHeight;

        text='平均成本：'+this.Data.ChipInfo.AveragePrice.toFixed(2)+'元';
        this.Canvas.fillText(text,left,bottom);
        bottom-=this.LineHeight;

        text=+this.Data.YPrice.toFixed(2)+'处获利盘：'+this.Data.ChipInfo.YProfitRate.toFixed(2)+'%';
        this.Canvas.fillText(text,left,bottom);
        bottom-=this.LineHeight;

        text='获利比例：';
        this.Canvas.fillText(text,left,bottom);
        var textWidth=this.Canvas.measureText(text).width+2;
        var barLeft=left+textWidth;
        var barWidth=(right-5-barLeft);
        this.Canvas.strokeStyle=this.ColorNoProfit;
        this.Canvas.strokeRect(barLeft,bottom-this.LineHeight,barWidth,this.LineHeight);
        this.Canvas.strokeStyle=this.ColorProfit;
        this.Canvas.strokeRect(barLeft,bottom-this.LineHeight,barWidth*(this.Data.ChipInfo.ProfitRate/100),this.LineHeight);
        text=this.Data.ChipInfo.ProfitRate.toFixed(2)+'%';
        this.Canvas.textAlign='center';
        this.Canvas.fillText(text,barLeft+barWidth/2,bottom);
        bottom-=this.LineHeight;

        this.Canvas.textAlign='left';
        text='成本分布,日期：'+IFrameSplitOperator.FormatDateString(this.Data.SelectData.Date);
        if (this.Data.SelectData.Time) text+=' '+IFrameSplitOperator.FormatTimeString(this.Data.SelectData.Time);
        this.Canvas.fillText(text,left,bottom);
        bottom-=this.LineHeight;

        if (this.ShowType!=1 && this.ShowType!=2) return;

        var right=ToFixedPoint(this.ChartBorder.GetChartWidth()-1)-1;
        this.Canvas.textAlign='right';
        var textWidth=50;
        this.Data.DayChip.sort(function(a,b){return b.Day-a.Day;})
        for(var i in this.Data.DayChip)
        {
            var item=this.Data.DayChip[i];
            var rate=0;
            if (this.Data.ChipInfo && this.Data.ChipInfo.Vol>0) rate=item.Vol/this.Data.ChipInfo.Vol*100;
            text=item.Day+'周期'+(this.ShowType==1?'前':'内')+'成本'+rate.toFixed(2)+'%';
            if (i==0) textWidth=this.Canvas.measureText(text).width+8;
            this.Canvas.fillStyle=item.Color;
            this.Canvas.fillRect(right-textWidth,bottom-this.LineHeight,textWidth,this.LineHeight);

            this.Canvas.fillStyle=this.DayInfoColor;
            this.Canvas.fillText(text,right,bottom);
            bottom-=this.LineHeight;
        }
    }

    this.DrawDayChip=function()
    {
        var KLineFrame=this.HQChart.Frame.SubFrame[0].Frame;
        for(var i in this.Data.DayChip)
        {
            var aryPoint=[];
            var chipData=this.Data.DayChip[i].Chip;
            if (!chipData) continue;
            var totalVol=0;
            for(var j=0;j<chipData.length;++j)
            {
                var vol=chipData[j];
                if(!vol) continue;
                totalVol+=vol;
                var price=(j+this.Data.MinPrice)/100;
                var y=KLineFrame.GetYFromData(price);
                var x=(vol/this.Data.MaxVol)*this.ClientRect.Width+this.ClientRect.Left;
                aryPoint.push({X:x,Y:y});
            }
            this.Data.DayChip[i].Vol=totalVol;
            this.DrawArea(aryPoint,this.Data.DayChip[i].Color);
        }
    }

    this.Clear=function()
    {
        var divButton=document.getElementById(this.ButtonID);
        if (divButton) this.ChartBorder.UIElement.parentNode.removeChild(divButton);
    }

    this.DrawButton=function()  //顶部按钮
    {
        var divButton=document.getElementById(this.ButtonID);
        if (!divButton)
        {
            divButton=document.createElement("div");
            divButton.className='klineframe-button';
            divButton.id=this.ButtonID;
            //为divToolbar添加属性identify
            // divButton.setAttribute("identify",this.Identify.toString());
            this.ChartBorder.UIElement.parentNode.appendChild(divButton);
        }

        var left=ToFixedPoint(this.ChartBorder.GetRight()+this.Left);
        var right=ToFixedPoint(this.ChartBorder.GetChartWidth()-1);
        var toolbarWidth=right-left;
        var toolbarHeight=this.ChartBorder.GetTitleHeight();
        // var left=this.ChartBorder.GetRight();
        var top=this.ChartBorder.GetTop();

        const spanStyle="<span class='{iconclass}' id='{iconid}' title='{icontitle}' style='cursor:pointer;display:inline-block;color:{iconcolor};font-size:{iconsize}px'></span>";
        const ICON_LIST=
        [
            {Class:'chip_default icon iconfont icon-chip_default', ID:'chip_default',Color:['#808080','#FF0000'],Title:'默认筹码分布图'},
            {Class:'chip_long icon iconfont icon-chip_date',ID:'chip_long',Color:['#808080','#FF8000'],Title:'远期筹码分布图'},
            {Class:'chip_recent icon iconfont icon-chip_date',ID:'chip_recent', Color:['#808080','#0000CC'],Title:'近期筹码分布图'}
        ];

        var spanHtml='';
        for(var i in ICON_LIST)
        {
            var item=ICON_LIST[i];
            var spanItem=spanStyle;
            spanItem=spanItem.replace('{iconclass}',item.Class);
            spanItem=spanItem.replace('{iconid}',item.ID);
            spanItem=spanItem.replace('{iconcolor}',item.Color[i==this.ShowType?1:0]);
            spanItem=spanItem.replace('{iconsize}',toolbarHeight);
            spanItem=spanItem.replace('{icontitle}',item.Title);

            if (spanHtml.length>0) spanHtml+='&nbsp;&nbsp;';
            spanHtml+=spanItem;
        }

        divButton.style.right = 5 + "px";
        divButton.style.top = top + "px";
        //divButton.style.width=toolbarWidth+"px";
        divButton.style.height=toolbarHeight+'px';
        divButton.innerHTML=spanHtml;

        var self = this;
        for(var i in ICON_LIST)
        {
            var item=ICON_LIST[i];
            $("#"+this.ButtonID+" ."+item.ID).click(
                {
                    IconID:item.ID,
                    ShowType:i
                },
                function (event) 
                {
                    var id=event.data.IconID;
                    var showType=event.data.ShowType;
                    self.ShowType=showType;
                    if (self.HQChart) self.HQChart.Draw();

                    for(var i in ICON_LIST)
                    {
                        var item=ICON_LIST[i];
                        var style=$("#"+self.ButtonID+" ."+item.ID)[0].style;
                        style['color']=item.Color[i==showType?1:0];
                    }
                }
            )
        }
    }

    this.DrawAllChip=function()
    {
        var KLineFrame=this.HQChart.Frame.SubFrame[0].Frame;
        var selectPrice=this.Data.SelectData.Close;
        var aryProfitPoint=[];
        var aryNoProfitPoint=[];
        var totalVol=0,totalAmount=0,totalProfitVol=0, totalYProfitVol=0;   //总的成交量, 总的成交金额, 总的盈利的成交量
        var yPrice=this.Data.YPrice;

        var maxPrice=KLineFrame.HorizontalMax;
        var minPrice=KLineFrame.HorizontalMin;

        var MaxVol=1;
        for(var i=0;i<this.Data.AllChip.length;++i)
        {
            var vol=this.Data.AllChip[i];
            if(!vol) continue;
            var price=(i+this.Data.MinPrice)/100;
            totalVol+=vol;
            totalAmount+=price*vol;

            if (price<yPrice) totalYProfitVol+=vol;     //获利的成交量
            if (price<selectPrice) totalProfitVol+=vol; //鼠标当前位置 获利的成交量

            if (price<=maxPrice && price>=minPrice)
            {
                if (MaxVol<vol) MaxVol=vol;
            }
        }
        this.Data.MaxVol=MaxVol;    //把成交量最大值替换成 当前屏成交量最大值
        
        for(var i=0;i<this.Data.AllChip.length;++i)
        {
            var vol=this.Data.AllChip[i];
            if(!vol) continue;
            var price=(i+this.Data.MinPrice)/100;
            if (price>maxPrice || price<minPrice) continue;

            var y=KLineFrame.GetYFromData(price);
            var x=(vol/this.Data.MaxVol)*this.ClientRect.Width+this.ClientRect.Left;
           
            if (price<selectPrice) aryProfitPoint.push({X:x,Y:y});
            else aryNoProfitPoint.push({X:x,Y:y});
        }

        this.Data.ChipInfo=
        {
            Vol:totalVol, AveragePrice:totalAmount/totalVol, ProfitVol:totalProfitVol, 
            ProfitRate:totalVol>0?totalProfitVol/totalVol*100:0,
            YProfitRate:totalVol>0?totalYProfitVol/totalVol*100:0
        };

        if (this.ShowType==0)
        {
            this.DrawLines(aryProfitPoint,this.ColorProfit);
            this.DrawLines(aryNoProfitPoint,this.ColorNoProfit);
            var averagePrice=this.Data.ChipInfo.AveragePrice;
            if (averagePrice>0 && averagePrice<=maxPrice && averagePrice>=minPrice) 
            {
                averagePrice=averagePrice.toFixed(2);
                this.DrawAveragePriceLine(aryProfitPoint,aryNoProfitPoint,KLineFrame.GetYFromData(averagePrice),this.ColorAveragePrice);
            }
        }
        else    //在火焰山模式下, 筹码用一个颜色
        {
            this.DrawLines(aryProfitPoint,this.ColorBG);
            this.DrawLines(aryNoProfitPoint,this.ColorBG);
        }
    }

    this.CalculateCast=function()   //计算 90% 70%的成本价
    {
        if (!this.Data.ChipInfo || !this.Data.ChipInfo.Vol) return;

        var aryCast=
        [
            {Start:0.05,End:0.95, MaxPrice:0, MinPrice:0, Rate:0},
            {Start:0.15,End:0.85, MaxPrice:0, MinPrice:0, Rate:0}
        ];

        var averagePrice=this.Data.ChipInfo.AveragePrice;
        var totalProfitVol=this.Data.ChipInfo.ProfitVol;
        var tempVol=0;
        for(var i=0, castCount=0;i<this.Data.AllChip.length;++i)
        {
            if (castCount==4) break;
            var vol=this.Data.AllChip[i];
            if (vol<=0) continue;

            var price=(i+this.Data.MinPrice)/100;
            tempVol+=vol;
            var rate=tempVol/totalProfitVol;
            
            for(var j in aryCast)
            {
                var itemCast=aryCast[j];
                if (itemCast.MinPrice<=0 && rate>itemCast.Start)
                {
                    itemCast.MinPrice=price;
                    ++castCount;
                }

                if (itemCast.MaxPrice<=0 && rate>itemCast.End)
                {
                    itemCast.MaxPrice=price;
                    ++castCount;
                }
            }
        }

        for(var i in aryCast)
        {
            var item=aryCast[i];
            var addPrice=item.MaxPrice+item.MinPrice;
            if (addPrice) item.Rate=Math.abs(item.MaxPrice-item.MinPrice)/addPrice*100;
        }

        this.Data.Cast=aryCast;
    }

    this.DrawArea=function(aryPoint,color)
    {
        if (aryPoint.length<=0) return;

        this.Canvas.fillStyle=color;
        this.Canvas.beginPath();
        this.Canvas.moveTo(this.ClientRect.Left,aryPoint[0].Y);
        for(var i in aryPoint)
        {
            var item=aryPoint[i];
            this.Canvas.lineTo(item.X,item.Y);
        }
        this.Canvas.lineTo(this.ClientRect.Left,aryPoint[aryPoint.length-1].Y);
        this.Canvas.fill();
    }

    this.DrawLines=function(aryPoint,color)
    {
        if (aryPoint.length<=0) return;
        this.Canvas.strokeStyle=color;
        this.Canvas.beginPath();
        for(var i in aryPoint)
        {
            var item=aryPoint[i];
            this.Canvas.moveTo(this.ClientRect.Left,item.Y);
            this.Canvas.lineTo(item.X,item.Y);
        }
        this.Canvas.stroke();
    }

    this.DrawAveragePriceLine=function(aryProfitPoint,aryNoProfitPoint,y,color)
    {
        for(var i in aryProfitPoint)
        {
            var item=aryProfitPoint[i];
            if (item.Y==y)
            {
                this.Canvas.strokeStyle=color;
                this.Canvas.beginPath();
                this.Canvas.moveTo(this.ClientRect.Left,item.Y);
                this.Canvas.lineTo(item.X,item.Y);
                this.Canvas.stroke();
                return;
            }
        }

        for(var i in aryNoProfitPoint)
        {
            var item=aryNoProfitPoint[i];
            if (item.Y==y)
            {
                this.Canvas.strokeStyle=color;
                this.Canvas.beginPath();
                this.Canvas.moveTo(this.ClientRect.Left,item.Y);
                this.Canvas.lineTo(item.X,item.Y);
                this.Canvas.stroke();
                return;
            }
        }
    }

    this.DrawBorder=function()
    {
        this.Canvas.strokeStyle=this.PenBorder;
        this.Canvas.strokeRect(this.ClientRect.Left,this.ClientRect.Top,this.ClientRect.Width,this.ClientRect.Height);
    }

    this.CalculateChip=function()   //计算筹码
    {
        if (!this.HQChart) return false;
        if (!this.HQChart.FlowCapitalReady) return false;
        var symbol=this.HQChart.Symbol;
        if (!symbol) return false;
        if (MARKET_SUFFIX_NAME.IsSHSZIndex(symbol)) return false;   //指数暂时不支持移动筹码

        var bindData=this.HQChart.ChartPaint[0].Data;
        //if (bindData.Period>=4) return false;   //分钟K线不支持, 没时间做,以后再做吧
        var count=bindData.DataOffset+parseInt(this.HQChart.CursorIndex);
        if (count>=bindData.Data.length) count=bindData.Data.length-1;
        var selData=bindData.Data[count];
        var yPrice=selData.Close;

        var mouseY=this.HQChart.LastPoint.Y;
        if (mouseY) yPrice=this.HQChart.Frame.SubFrame[0].Frame.GetYData(mouseY);
        
        //console.log("[StockChip::CalculateChip]",count,this.HQChart.CursorIndex,selData);
        const rate=1;
        var aryVol=[];
        var seed=1,vol,maxPrice,minPrice;
        for(let i=count;i>=0;--i)
        {
            var item=bindData.Data[i];
            var changeRate=1;   //换手率
            if (item.FlowCapital>0) changeRate=item.Vol/item.FlowCapital;
            if (i==count) vol=item.Vol*changeRate;
            else vol=item.Vol*seed;
            var dataItem={Vol:vol,High:item.High,Low:item.Low};
            aryVol.push(dataItem);
            seed*=(1-changeRate*rate);

            if (!maxPrice || maxPrice<item.High) maxPrice=item.High;
            if (!minPrice || minPrice>item.Low) minPrice=item.Low;
        }

        //console.log("[StockChip::CalculateChip]",maxPrice,minPrice);
        if (!maxPrice || !minPrice) return true;

        maxPrice=parseInt(maxPrice*100);
        minPrice=parseInt(minPrice*100);

        var dataCount=maxPrice-minPrice;
        var aryChip=new Array()
        for(let i=0;i<=dataCount;++i)
        {
            aryChip.push(0);
        }

        var maxVol=1;
        var dayChip=[];
        if (this.ShowType==2)
        {
            var dayChip=
            [
                {Day:100, Color:this.DAY_COLOR[1][5]}, {Day:60, Color:this.DAY_COLOR[1][4]}, {Day:30, Color:this.DAY_COLOR[1][3]},
                {Day:20, Color:this.DAY_COLOR[1][2]}, {Day:10, Color:this.DAY_COLOR[1][1]}, {Day:5, Color:this.DAY_COLOR[1][0]}
            ];
            for(let i in aryVol)
            {
                var item=aryVol[i];
                var high=parseInt(item.High*100);
                var low=parseInt(item.Low*100);
                var averageVol=item.Vol;
                if (high-low>0) averageVol=item.Vol/(high-low);
                if (averageVol<=0.000000001) continue;

                for(var k=0;k<dayChip.length;++k)
                {
                    if (i==dayChip[k].Day) 
                    {
                        dayChip[k].Chip=aryChip.slice(0);
                        break;
                    }
                }
                
                for(var j=low;j<=high && j<=maxPrice;++j)
                {
                    var index=j-minPrice;
                    aryChip[index]+=averageVol;
                    if (maxVol<aryChip[index]) maxVol=aryChip[index];
                }
            }
        }
        else if (this.ShowType==1)
        {
            var dayChip=
            [
                {Day:5, Color:this.DAY_COLOR[0][0]},{Day:10, Color:this.DAY_COLOR[0][1]},{Day:20, Color:this.DAY_COLOR[0][2]},
                {Day:30, Color:this.DAY_COLOR[0][3]},{Day:60, Color:this.DAY_COLOR[0][4]},{Day:100, Color:this.DAY_COLOR[0][5]}
            ];

            for(let i=aryVol.length-1;i>=0;--i)
            {
                var item=aryVol[i];
                var high=parseInt(item.High*100);
                var low=parseInt(item.Low*100);
                var averageVol=item.Vol;
                if (high-low>0) averageVol=item.Vol/(high-low);
                if (averageVol<=0.000000001) continue;

                for(var k=0;k<dayChip.length;++k)
                {
                    if (i==dayChip[k].Day) 
                    {
                        dayChip[k].Chip=aryChip.slice(0);
                        break;
                    }
                }
                
                for(var j=low;j<=high && j<=maxPrice;++j)
                {
                    var index=j-minPrice;
                    aryChip[index]+=averageVol;
                    if (maxVol<aryChip[index]) maxVol=aryChip[index];
                }
            }
        }
        else
        {
            for(let i in aryVol)
            {
                var item=aryVol[i];
                var high=parseInt(item.High*100);
                var low=parseInt(item.Low*100);
                var averageVol=item.Vol;
                if (high-low>0) averageVol=item.Vol/(high-low);
                if (averageVol<=0.000000001) continue;

                for(var j=low;j<=high && j<=maxPrice;++j)
                {
                    var index=j-minPrice;
                    aryChip[index]+=averageVol;
                    if (maxVol<aryChip[index]) maxVol=aryChip[index];
                }
            }
        }

        this.Data={AllChip:aryChip, MaxVol:maxVol, MaxPrice:maxPrice, MinPrice:minPrice,SelectData:selData, DayChip:dayChip, YPrice:yPrice};
        return true;
    }
}

//画图工具条
function DrawToolsButton()
{
    this.newMethod=IExtendChartPainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='DrawToolsButton';
    this.HQChart;
    this.ID=Guid();
    this.ToolsDiv;
    // this.Color='rgb(105,105,105)';    //颜色
    this.Color = "#696969";        //input type="color"不支持rgb的颜色格式

    //this.Left=5;
    this.Right=5;
    this.Top=5;
    this.ToolsWidth=45;         //宽度
    this.IsAutoIndent=0;    //是否自动缩进

    this.SetOption=function(option)
    {
        if (!option) return;
        if (option.Top>0) this.Top=option.Top;
        if (option.Right>0) this.Right=option.Right;
        if (option.IsAutoIndent>0) this.IsAutoIndent=option.IsAutoIndent;
    }

    this.Clear=function()
    {
        if (this.ToolsDiv) this.ChartBorder.UIElement.parentNode.removeChild(this.ToolsDiv);
    }

    this.Draw = function () {
        if (this.SizeChange == false) return;

        //工具列表
        const TOOL_LIST =
            [
                [
                    { HTML: { Title: '线段', IClass: 'iconfont icon-draw_line', ID: 'icon-segment' }, Name: '线段' },
                    { HTML: { Title: '射线', IClass: 'iconfont icon-draw_rays', ID: 'icon-beam' }, Name: '射线' },
                    { HTML: { Title: '趋势线', IClass: 'iconfont icon-draw_trendline', ID: 'icon-trendline' }, Name: '趋势线' },
                    { HTML: { Title: '水平线', IClass: 'iconfont icon-draw_hline', ID: 'icon-hline' }, Name: '水平线' },
                    { HTML: { Title: '平行线', IClass: 'iconfont icon-draw_parallel_lines', ID: 'icon-parallellines' }, Name: '平行线' },
                    { HTML: { Title: '平行通道', IClass: 'iconfont icon-draw_parallelchannel', ID: 'icon-parallelchannel' }, Name: '平行通道' },
                    { HTML: { Title: '价格通道线', IClass: 'iconfont icon-draw_pricechannel', ID: 'icon-pricechannel' }, Name: '价格通道线' },
                    { HTML: { Title: 'M头W底', IClass: 'iconfont icon-draw_wavemw', ID: 'icon-wavemw' }, Name: 'M头W底' },
                ],
                [
                    { HTML: { Title: '圆弧', IClass: 'iconfont icon-draw_arc', ID: 'icon-arc' }, Name: '圆弧线' },
                    { HTML: { Title: '矩形', IClass: 'iconfont icon-rectangle', ID: 'icon-rect' }, Name: '矩形' },
                    { HTML: { Title: '平行四边形', IClass: 'iconfont icon-draw_quadrangle', ID: 'icon-quad' }, Name: '平行四边形' },
                    { HTML: { Title: '三角形', IClass: 'iconfont icon-draw_triangle', ID: 'icon-triangle' }, Name: '三角形' },
                    { HTML: { Title: '圆', IClass: 'iconfont icon-draw_circle', ID: 'icon-circle' }, Name: '圆' },
                    { HTML: { Title: '对称角度', IClass: 'iconfont icon-draw_symangle', ID: 'icon-symangle' }, Name: '对称角度' },
                ],
                [
                    { HTML: { Title: '文本', IClass: 'iconfont icon-draw_text', ID: 'icon-text' }, Name: '文本' },
                    { HTML: { Title: '向上箭头', IClass: 'iconfont icon-arrow_up', ID: 'icon-arrowup' }, Name: 'icon-arrow_up' },
                    { HTML: { Title: '向下箭头', IClass: 'iconfont icon-arrow_down', ID: 'icon-arrowdown' }, Name: 'icon-arrow_down' },
                    { HTML: { Title: '向左箭头', IClass: 'iconfont icon-arrow_left', ID: 'icon-arrowleft' }, Name: 'icon-arrow_left' },
                    { HTML: { Title: '向右箭头', IClass: 'iconfont icon-arrow_right', ID: 'icon-arrowright' }, Name: 'icon-arrow_right' },
                ],
                [
                    { HTML: { Title: '江恩角度线', IClass: 'iconfont icon-draw_gannfan', ID: 'icon-gannfan' }, Name: '江恩角度线' },
                    { HTML: { Title: '斐波那契周期线', IClass: 'iconfont icon-draw_fibonacci', ID: 'icon-fibonacci' }, Name: '斐波那契周期线' },
                    { HTML: { Title: '阻速线', IClass: 'iconfont icon-draw_resline', ID: 'icon-resline' }, Name: '阻速线' },
                    { HTML: { Title: '黄金分割', IClass: 'iconfont icon-draw_goldensection', ID: 'icon-goldensection' }, Name: '黄金分割' },
                    { HTML: { Title: '百分比线', IClass: 'iconfont icon-draw_percentage', ID: 'icon-percentage' }, Name: '百分比线' },
                    { HTML: { Title: '波段线', IClass: 'iconfont icon-draw_waveband', ID: 'icon-waveband' }, Name: '波段线' },
                ],
                [{ HTML: { Title: '全部删除', IClass: 'iconfont icon-recycle_bin', ID: 'icon-delete' }, Name: '全部删除' }]
            ];

        var hqChart = this.HQChart;

        if (!this.ToolsDiv) {
            var div = document.createElement("div");
            div.className = 'drawtools';
            div.id = this.ID;

            var spanList = "";  //一层菜单
            var menuTwoList = ""; //二层菜单
            var menuOne = new Array();
            TOOL_LIST.forEach(function(item,index){
                menuOne.push(item[0]);
            });
            for (var i = 0; i < TOOL_LIST.length; i++) {
                var itemOut = menuOne[i];
                var itemIn = TOOL_LIST[i];
                var menuTwoStr = "";
                var contentArrow = "";
                for (var j = 0; j < itemIn.length; j++) {
                    var currentItem = itemIn[j];
                    var menuTwoName = currentItem.Name;
                    if(menuTwoName.indexOf('up') > -1){
                        menuTwoName = "向上箭头";
                    }else if(menuTwoName.indexOf('down') > -1){
                        menuTwoName = "向下箭头";
                    }else if(menuTwoName.indexOf('left') > -1){
                        menuTwoName = "向左箭头";
                    }else if(menuTwoName.indexOf('right') > -1){
                        menuTwoName = "向右箭头";
                    }
                    menuTwoStr += '<p class="menuTwoItem ' + currentItem.HTML.ID + '">' + menuTwoName + '<i class="' + currentItem.HTML.IClass + '" title="' + currentItem.HTML.Title + '"></i></p>';
                }
                if (i !== TOOL_LIST.length - 1) { //不是“全部删除”项
                    menuTwoList = '<div class="menuTwo">' + menuTwoStr + '</div>';
                    contentArrow = '<i class="contentArrow iconfont icon-menu_arraw_left"></i>';
                } else {
                    menuTwoList = "";
                    contentArrow = "";
                }

                var spanNode = '<div class="icon-image ' + 'first-' + itemOut.HTML.ID + '"><i class="' + itemOut.HTML.IClass + '" title="' + itemOut.HTML.Title + '"></i>' + menuTwoList + contentArrow +'</div>';
                spanList += spanNode;
            }
            this.ChartBorder.UIElement.parentNode.appendChild(div);

            div.innerHTML = spanList;
            this.ToolsDiv = div;
            
            for (var i in TOOL_LIST) {
                var item = TOOL_LIST[i][0];
                $('#' + this.ID + " .first-" + item.HTML.ID).hover(function(){  //箭头的旋转过渡
                    $(".drawtools").find(".contentArrow").hide();
                    $(this).find(".contentArrow").removeClass("trans").show();
                });
                $('#' + this.ID + " .first-" + item.HTML.ID+" .contentArrow").click(function(event){ //点击三角展示二级菜单
                    event.stopPropagation();
                    $(".drawtools").find(".menuTwo").hide();
                    $(this).siblings('.menuTwo').show();
                });
                $('#' + this.ID + " .first-" + item.HTML.ID+" .trans").click(function(){ //点击三角隐藏二级菜单
                    event.stopPropagation();
                    $(this).siblings('.menuTwo').hide();
                });
                
                
                if (item.Name == '全部删除') {
                    $('#' + this.ID + " .first-icon-delete").click(function () {
                        $(".drawtools").find(".menuTwo").hide();
                        $(this).siblings().removeClass('active');
                        $(this).addClass('active');
                        hqChart.ClearChartDrawPicture();
                        $(".subTolls").css("display", "none");
                    });
                }
                else {
                    $('#' + this.ID + " .first-" + menuOne[i].HTML.ID).click( //一层菜单类名是：“first-”+item.HTML.ID
                        {
                            // DrawName: menuOne[i].Name,  //把画法名字传进去
                            CurrentIndex:i
                        },
                        function (event) {
                            $(".drawtools").find(".menuTwo").hide();
                            $(this).siblings().removeClass('active');
                            $(this).addClass('active');
                            hqChart.CreateChartDrawPicture(menuOne[event.data.CurrentIndex].Name);
                        }
                    );
                    for (var j in TOOL_LIST[i]) {
                        var itemTwo = TOOL_LIST[i][j];
                        let classname = itemTwo.HTML.IClass;  //闭包问题
                        $('#' + this.ID + ' .' + itemTwo.HTML.ID).hover(function(event){
                            event.stopPropagation();
                            $(this).closest('.icon-image').find(".contentArrow").addClass("trans");
                        });
                        $('#' + this.ID + ' .' + itemTwo.HTML.ID).click(//二层菜单
                            {
                                DrawName: itemTwo.Name,  //把画法名字传进去
                                CurrentIndex:i,
                                CurrentData:itemTwo
                            },
                            function (event) {
                                event.stopPropagation();
                                $(this).closest('.icon-image').find(".contentArrow").hide();
                                $(this).siblings().removeClass("current");
                                $(this).addClass("current");
                                $(this).closest('.icon-image').children('i').eq(0).removeClass().addClass(classname,"active").attr('title',event.data.CurrentData.HTML.Title);
                                menuOne.splice(event.data.CurrentIndex,1,event.data.CurrentData);
                                $(this).parent().hide();
                                hqChart.CreateChartDrawPicture(event.data.DrawName);
                            }
                        );
                    }
                }
            }

        }
        var curID = this.ID;
        $(document).click(function(event){
            if(!($("#"+curID).is(event.target)) && ($("#"+curID).has(event.target).length === 0)){
                $("#"+curID+" .menuTwo").hide();
                $("#"+curID+" .contentArrow").hide();
            }
        });
        var scrollPos = GetScrollPosition();
        // var left=this.ChartBorder.GetChartWidth()-this.Right-this.ToolsWidth;
        var right = this.Right;
        // var top = this.Top+this.ChartBorder.UIElement.getBoundingClientRect().top+scrollPos.Top;
        var top = this.ChartBorder.GetTop();
        this.ToolsDiv.style.right = right + "px";
        this.ToolsDiv.style.top = top + "px";
        this.ToolsDiv.style.width = this.ToolsWidth + "px";
        this.ToolsDiv.style.height = 'auto';
        this.ToolsDiv.style.position = "absolute";
        this.ToolsDiv.style.display = "block";
        // this.ToolsDiv.style.paddingLeft = "10px";

        this.SizeChange == true;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//坐标分割
//
//
////////////////////////////////////////////////////////////////////////////////////////////////////
function IFrameSplitOperator()
{
    this.ChartBorder;                   //边框信息
    this.Frame;                         //框架信息
    this.FrameSplitData;                //坐标轴分割方法
    this.SplitCount=5;                  //刻度个数
    this.StringFormat=0;                //刻度字符串格式
    this.IsShowLeftText=true;           //显示左边刻度 
    this.IsShowRightText=true;          //显示右边刻度

    //////////////////////
    // data.Min data.Max data.Interval data.Count
    //
    this.IntegerCoordinateSplit=function(data)
    {
        var splitItem=this.FrameSplitData.Find(data.Interval);
        if (!splitItem) return false;

        if (data.Interval==splitItem.FixInterval) return true;

        //调整到整数倍数,不能整除的 +1
        var fixMax=parseInt((data.Max/(splitItem.FixInterval)+0.5).toFixed(0))*splitItem.FixInterval;
        var fixMin=parseInt((data.Min/(splitItem.FixInterval)-0.5).toFixed(0))*splitItem.FixInterval;
        if (data.Min==0) fixMin=0;  //最小值是0 不用调整了.
        if (fixMin<0 && data.Min>0) fixMin=0;   //都是正数的, 最小值最小调整为0

        var count=0;
        for(var i=fixMin;(i-fixMax)<0.00000001;i+=splitItem.FixInterval)
        {
            ++count;
        }

        data.Interval=splitItem.FixInterval;
        data.Max=fixMax;
        data.Min=fixMin;
        data.Count=count;

        return true;
    }

    this.Filter = function (aryInfo,keepZero) 
    {
        if (this.SplitCount <= 0 || aryInfo.length <= 0 || aryInfo.length < this.SplitCount) return aryInfo;

        //分割线比预设的多, 过掉一些
        var filter = parseInt(aryInfo.length / this.SplitCount);
        if (filter <= 1) filter = 2;
        var data = [];
        for (var i = 0; i < aryInfo.length; i += filter) 
        {
            if (i + filter >= aryInfo.length && i != aryInfo.length - 1) //最后一个数据放进去
            {
                data.push(aryInfo[aryInfo.length - 1]);
            }
            else 
            {
                data.push(aryInfo[i]);
            }
        }

        if (this.SplitCount == 2 && data.length>2) //之显示第1个和最后一个刻度
        {
            for(var i=1;i<data.length-1;++i)
            {
                var item=data[i];
                item.Message[0]=null;
                item.Message[1]=null;
            }
        }

        if (keepZero)   //如果不存在0轴,增加一个0轴,刻度信息部显示
        {
            var bExsitZero=false;
            for(var i=0;i<data;++i)
            {
                var item=data[i];
                if (Math.abs(item.Value) < 0.00000001) 
                {
                    bExsitZero=true;
                    break;
                }
            }

            if (bExsitZero==false)
            {
                var zeroCoordinate = new CoordinateInfo();
                zeroCoordinate.Value = 0;
                zeroCoordinate.Message[0] = null
                zeroCoordinate.Message[1] = null;
                data.push(zeroCoordinate);
            }
        }

        return data;
    }

    this.RemoveZero = function (aryInfo)   //移除小数后面多余的0
    {
        //所有的数字小数点后面都0,才会去掉
        var isAllZero = [true, true];
        for (var i in aryInfo) 
        {
            var item = aryInfo[i];
            var message = item.Message[0];
           if (!this.IsDecimalZeroEnd(message)) isAllZero[0] = false;

            var message = item.Message[1];
            if (!this.IsDecimalZeroEnd(message)) isAllZero[1] = false;
        }

        if (isAllZero[0] == false && isAllZero[1] == false) return;
        for (var i in aryInfo) 
        {
            var item = aryInfo[i];
            if (isAllZero[0]) 
            {
                var message = item.Message[0];
                if (message!=null)
                {
                    if (typeof (message) == 'number') message = message.toString();
                    item.Message[0] = message.replace(/[.][0]+/g, '');
                }
            }

            if (isAllZero[1])
            {
                var message = item.Message[1];
                if (message!=null)
                {
                    if (typeof (message) == 'number') message = message.toString();
                    item.Message[1] = message.replace(/[.][0]+/g, '');
                }
            }
        }
    }

    this.IsDecimalZeroEnd = function (text)   //是否是0结尾的小数
    {
        if (text==null) return true;
        if (typeof(text)=='number') text=text.toString();
        if (text=='0') return true;
        
        var pos = text.search(/[.]/);
        if (pos < 0) return false;

        for (var i = pos + 1; i < text.length; ++i) 
        {
            var char = text.charAt(i);
            if (char >= '1' && char <= '9') return false;
        }

        return true;
    }
    
}

//字符串格式化 千分位分割
IFrameSplitOperator.FormatValueThousandsString=function(value,floatPrecision)
{
    if (value==null || isNaN(value))
    {
        if (floatPrecision>0)
        {
            var nullText='-.';
            for(var i=0;i<floatPrecision;++i)
                nullText+='-';
            return nullText;
        }

        return '--';
    }

    var result='';
    var num=value.toFixed(floatPrecision);
    if(floatPrecision>0){
        var numFloat = num.split('.')[1];
        var numM = num.split('.')[0];
        while (numM.length > 3)
        {
            result = ',' + numM.slice(-3) + result;
            numM = numM.slice(0, numM.length - 3);
        }
        if (numM) { result = numM + result + '.' + numFloat; }
    }else{
        while (num.length > 3)
        {
            result = ',' + num.slice(-3) + result;
            num = num.slice(0, num.length - 3);
        }
        if (num) { result = num + result; }
    }
    
    return result;
}

//数据输出格式化 floatPrecision=小数位数
IFrameSplitOperator.FormatValueString=function(value, floatPrecision)
{
    if (value==null || isNaN(value))
    {
        if (floatPrecision>0)
        {
            var nullText='-.';
            for(var i=0;i<floatPrecision;++i)
                nullText+='-';
            return nullText;
        }

        return '--';
    }

    if (value<0.00000000001 && value>-0.00000000001)
    {
        return "0";
    }

    var absValue = Math.abs(value);
    if (absValue < 10000)
    {
        return value.toFixed(floatPrecision);
    }
    else if (absValue < 100000000)
    {
        return (value/10000).toFixed(floatPrecision)+"万";
    }
    else if (absValue < 1000000000000)
    {
        return (value/100000000).toFixed(floatPrecision)+"亿";
    }
    else
    {
        return (value/1000000000000).toFixed(floatPrecision)+"万亿";
    }

    return TRUE;
}

IFrameSplitOperator.NumberToString=function(value)
{
    if (value<10) return '0'+value.toString();
    return value.toString();
}

IFrameSplitOperator.FormatDateString=function(value,format)
{
    var year=parseInt(value/10000);
    var month=parseInt(value/100)%100;
    var day=value%100;

    switch(format)
    {
        case 'MM-DD':
            return IFrameSplitOperator.NumberToString(month) + '-' + IFrameSplitOperator.NumberToString(day);
        default:
            return year.toString() + '-' + IFrameSplitOperator.NumberToString(month) + '-' + IFrameSplitOperator.NumberToString(day);
    }
}

IFrameSplitOperator.FormatTimeString=function(value)
{
    if (value<10000)
    {
        var hour=parseInt(value/100);
        var minute=value%100;
        return IFrameSplitOperator.NumberToString(hour)+':'+ IFrameSplitOperator.NumberToString(minute);
    }
    else
    {
        var hour=parseInt(value/10000);
        var minute=parseInt((value%1000)/100);
        var second=value%100;
        return IFrameSplitOperator.NumberToString(hour)+':'+ IFrameSplitOperator.NumberToString(minute) + ':' + IFrameSplitOperator.NumberToString(second);
    }
}

//报告格式化
IFrameSplitOperator.FormatReportDateString=function(value)
{
    var year=parseInt(value/10000);
    var month=parseInt(value/100)%100;
    var monthText;
    switch(month)
    {
        case 3:
            monthText="一季度报";
            break;
        case 6:
            monthText="半年报";
            break;
        case 9:
            monthText="三季度报";
            break;
        case 12:
            monthText="年报";
            break;
    }

    return year.toString()+ monthText;
}

IFrameSplitOperator.FormatDateTimeString=function(value,isShowDate)
{
    var aryValue=value.split(' ');
    if (aryValue.length<2) return "";
    var time=parseInt(aryValue[1]);
    var minute=time%100;
    var hour=parseInt(time/100);
    var text=(hour<10? ('0'+hour.toString()):hour.toString()) + ':' + (minute<10?('0'+minute.toString()):minute.toString());

    if (isShowDate==true)
    {
        var date=parseInt(aryValue[0]);
        var year=parseInt(date/10000);
        var month=parseInt(date%10000/100);
        var day=date%100;
        text=year.toString() +'-'+ (month<10? ('0'+month.toString()) :month.toString()) +'-'+ (day<10? ('0'+day.toString()):day.toString()) +" " +text;
    }

    return text;
}

//字段颜色格式化
IFrameSplitOperator.FormatValueColor = function (value, value2) 
{
    if (value != null && value2 == null)  //只传一个值的 就判断value正负
    {
        if (value == 0) return 'PriceNull';
        else if (value > 0) return 'PriceUp';
        else return 'PriceDown';
    }

    //2个数值对比 返回颜色
    if (value == null || value2 == null) return 'PriceNull';
    if (value == value2) return 'PriceNull';
    else if (value > value2) return 'PriceUp';
    else return 'PriceDown';
}

IFrameSplitOperator.IsNumber=function(value)
{
    if (value==null) return false;
    if (isNaN(value)) return false;

    return true;
}

//判断是否是正数
IFrameSplitOperator.IsPlusNumber=function(value)
{
    if (value==null) return false;
    if (isNaN(value)) return false;

    return value>0;
}

//判断字段是否存在
IFrameSplitOperator.IsObjectExist=function(obj)
{
    if (obj===undefined) return false;
    if (obj==null) return false;
    
    return true;
}

function FrameSplitKLinePriceY()
{
    this.newMethod=IFrameSplitOperator;   //派生
    this.newMethod();
    delete this.newMethod;
    this.CoordinateType=0;  //坐标类型 0=普通坐标  1=百分比坐标 (右边坐标刻度)
    this.Symbol;
    this.Data;              //K线数据 (计算百分比坐标)

    this.Operator=function()
    {
        var splitData={};
        splitData.Max=this.Frame.HorizontalMax;
        splitData.Min=this.Frame.HorizontalMin;
        splitData.Count=this.SplitCount;
        splitData.Interval=(splitData.Max-splitData.Min)/(splitData.Count-1);
        var pixelTatio = GetDevicePixelRatio();             //获取设备的分辨率
        var width=this.Frame.ChartBorder.GetChartWidth();   //画布的宽度
        var isPhoneModel=width<450*pixelTatio;
        var defaultfloatPrecision=GetfloatPrecision(this.Symbol);
        if (isPhoneModel && MARKET_SUFFIX_NAME.IsSHSZIndex(this.Symbol)) defaultfloatPrecision = 0;    //手机端指数不显示小数位数,太长了
        console.log('[FrameSplitKLinePriceY]' + ' isPhoneModel='+isPhoneModel + 'defaultfloatPrecision='+defaultfloatPrecision);

        switch(this.CoordinateType)
        {
            case 1:
                this.SplitPercentage(splitData,defaultfloatPrecision);
                break;
            default:
                this.SplitDefault(splitData,defaultfloatPrecision);
                break;
        }

        this.Frame.HorizontalInfo = this.Filter(this.Frame.HorizontalInfo,false);
        this.Frame.HorizontalMax=splitData.Max;
        this.Frame.HorizontalMin=splitData.Min;
    }

    this.SplitPercentage=function(splitData,floatPrecision)    //百分比坐标
    {
        var firstOpenPrice=this.GetFirstOpenPrice();
        splitData.Max=(splitData.Max-firstOpenPrice)/firstOpenPrice;
        splitData.Min=(splitData.Min-firstOpenPrice)/firstOpenPrice;
        splitData.Interval=(splitData.Max-splitData.Min)/(splitData.Count-1);
        this.IntegerCoordinateSplit(splitData);

        this.Frame.HorizontalInfo=[];
        for(var i=0,value=splitData.Min;i<splitData.Count;++i,value+=splitData.Interval)
        {
            var price=(value+1)*firstOpenPrice;
            this.Frame.HorizontalInfo[i]= new CoordinateInfo();
            this.Frame.HorizontalInfo[i].Value=price;
            if (this.IsShowLeftText) this.Frame.HorizontalInfo[i].Message[0]=price.toFixed(floatPrecision);   //左边价格坐标      
            if (this.IsShowRightText) this.Frame.HorizontalInfo[i].Message[1]=(value*100).toFixed(2)+'%';      //右边百分比
        }

        splitData.Min=(1+splitData.Min)*firstOpenPrice; //最大最小值调整
        splitData.Max=(1+splitData.Max)*firstOpenPrice;
    }

    this.SplitDefault=function(splitData,floatPrecision)       //默认坐标
    {
        this.IntegerCoordinateSplit(splitData);
       
        this.Frame.HorizontalInfo=[];
        for(var i=0,value=splitData.Min;i<splitData.Count;++i,value+=splitData.Interval)
        {
            this.Frame.HorizontalInfo[i]= new CoordinateInfo();
            this.Frame.HorizontalInfo[i].Value=value;
            if (this.IsShowLeftText)  this.Frame.HorizontalInfo[i].Message[0]=value.toFixed(floatPrecision);
            if (this.IsShowRightText)   this.Frame.HorizontalInfo[i].Message[1]=value.toFixed(floatPrecision);
        }
    }

    this.GetFirstOpenPrice=function()   //获取显示第1个数据的开盘价
    {
        if (!this.Data) return null;

        var xPointCount=this.Frame.XPointCount;
        for(var i=this.Data.DataOffset,j=0;i<this.Data.Data.length && j<xPointCount;++i,++j)
        {
            var data=this.Data.Data[i];
            if (data.Open==null || data.High==null || data.Low==null || data.Close==null) continue;

            return data.Open;
        }

        return null;
    }
}

function FrameSplitY()
{
    this.newMethod=IFrameSplitOperator;   //派生
    this.newMethod();
    delete this.newMethod;

    this.SplitCount=3;                        //刻度个数
    this.FloatPrecision = 2;                  //坐标小数位数(默认2)
    this.FLOATPRECISION_RANGE=[1,0.1,0.01,0.001,0.0001];

    this.GetFloatPrecision=function(value,floatPrecision)
    {
        if (value>this.FLOATPRECISION_RANGE[0]) return floatPrecision;
        if (floatPrecision<0) return 2;
        for(;floatPrecision<this.FLOATPRECISION_RANGE.length;++floatPrecision)
        {
            if (value>this.FLOATPRECISION_RANGE[floatPrecision]) break;
        }

        return floatPrecision;
    }

    this.Operator=function()
    {
        var splitData={};
        splitData.Max=this.Frame.HorizontalMax;
        splitData.Min=this.Frame.HorizontalMin;
        if(this.Frame.YSpecificMaxMin)
        {
            splitData.Count=this.Frame.YSpecificMaxMin.Count;
            splitData.Interval=(splitData.Max-splitData.Min)/(splitData.Count-1);
        }
        else
        {
            splitData.Count=this.SplitCount;
            splitData.Interval=(splitData.Max-splitData.Min)/(splitData.Count-1);
            this.IntegerCoordinateSplit(splitData);
        }

        this.Frame.HorizontalInfo=[];

        if (this.Frame.YSplitScale) //固定坐标
        {
            for(var i in this.Frame.YSplitScale)
            {
                var value=this.Frame.YSplitScale[i];
                var coordinate=new CoordinateInfo();
                coordinate.Value=value;

                var absValue=Math.abs(value);
                if (absValue<0.0000000001) 
                {
                    coordinate.Message[1]=0;
                }
                else if (absValue<this.FLOATPRECISION_RANGE[this.FLOATPRECISION_RANGE.length-1]) 
                {
                    coordinate.Message[1] = value.toExponential(2).toString();
                }
                else
                {
                    var floatPrecision=this.GetFloatPrecision(absValue,this.FloatPrecision); //数据比小数位数还小, 调整小数位数
                    coordinate.Message[1] = IFrameSplitOperator.FormatValueString(value, floatPrecision);
                }

                coordinate.Message[0]=coordinate.Message[1];

                if (this.IsShowLeftText==false) this.Frame.HorizontalInfo[i].Message[0]=null;
                if (this.IsShowRightText==false) this.Frame.HorizontalInfo[i].Message[1]=null;

                this.Frame.HorizontalInfo.push(coordinate);
            }
        }
        else
        {
            for(var i=0,value=splitData.Min;i<splitData.Count;++i,value+=splitData.Interval)
            {
                this.Frame.HorizontalInfo[i]= new CoordinateInfo();
                this.Frame.HorizontalInfo[i].Value=value;

                if (this.StringFormat==1)   //手机端格式 如果有万,亿单位了 去掉小数
                {
                    var floatPrecision=this.FloatPrecision;
                    if (!isNaN(value) && Math.abs(value) > 1000) floatPrecision=0;
                    this.Frame.HorizontalInfo[i].Message[1]=IFrameSplitOperator.FormatValueString(value,floatPrecision);
                }
                else
                {
                    var absValue=Math.abs(value);
                    if (absValue<0.0000000001) 
                    {
                        this.Frame.HorizontalInfo[i].Message[1]=0;
                    }
                    else if (absValue<this.FLOATPRECISION_RANGE[this.FLOATPRECISION_RANGE.length-1]) 
                    {
                        this.Frame.HorizontalInfo[i].Message[1] = value.toExponential(2).toString();
                    }
                    else
                    {
                        var floatPrecision=this.GetFloatPrecision(absValue,this.FloatPrecision); //数据比小数位数还小, 调整小数位数
                        this.Frame.HorizontalInfo[i].Message[1] = IFrameSplitOperator.FormatValueString(value, floatPrecision);
                    }
                }
                
                this.Frame.HorizontalInfo[i].Message[0]=this.Frame.HorizontalInfo[i].Message[1];
                if (this.IsShowLeftText==false) this.Frame.HorizontalInfo[i].Message[0]=null;
                if (this.IsShowRightText==false) this.Frame.HorizontalInfo[i].Message[1]=null;
                //this.Frame.HorizontalInfo[i].Font="14px 微软雅黑";
                //this.Frame.HorizontalInfo[i].TextColor="rgb(100,0,200)";
                //this.Frame.HorizontalInfo[i].LineColor="rgb(220,220,220)";
            }
        }

        this.Frame.HorizontalInfo = this.Filter(this.Frame.HorizontalInfo,(splitData.Max>0 && splitData.Min<0));
        this.RemoveZero(this.Frame.HorizontalInfo);
        this.Frame.HorizontalMax=splitData.Max;
        this.Frame.HorizontalMin=splitData.Min;
    }
}

function FrameSplitKLineX()
{
    this.newMethod=IFrameSplitOperator;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ShowText=true;                 //是否显示坐标信息

    this.Operator=function()
    {
        if (this.Frame.Data==null) return;
        this.Frame.VerticalInfo=[];
        var xOffset=this.Frame.Data.DataOffset;
        var xPointCount=this.Frame.XPointCount;

        var lastYear=null, lastMonth=null;
        var minDistance=12;
        for(var i=0, index=xOffset, distance=minDistance;i<xPointCount && index<this.Frame.Data.Data.length ;++i,++index)
        {
            var year=parseInt(this.Frame.Data.Data[index].Date/10000);
            var month=parseInt(this.Frame.Data.Data[index].Date/100)%100;

            if (distance<minDistance ||
                (lastYear!=null && lastYear==year && lastMonth!=null && lastMonth==month))
            {
                lastMonth=month;
                ++distance;
                continue;
            }

            var info= new CoordinateInfo();
            info.Value=index-xOffset;
            var text;
            if (lastYear==null || lastYear!=year)
            {
                text=year.toString();
            }
            else if (lastMonth==null || lastMonth!=month)
            {
                text=month.toString()+"月";
            }

            lastYear=year;
            lastMonth=month;
            if (this.ShowText)
            {
                info.Message[0]=text;
            }

            this.Frame.VerticalInfo.push(info);
            distance=0;
        }
    }
}

function FrameSplitMinutePriceY()
{
    this.newMethod=IFrameSplitOperator;   //派生
    this.newMethod();
    delete this.newMethod;

    this.YClose;                        //昨收
    this.Data;                          //分钟数据
    this.AverageData;                   //分钟均线数据
    this.OverlayChartPaint;
    this.SplitCount=7;
    this.Symbol;

    this.Operator=function()
    {
        this.Frame.HorizontalInfo=[];
        if (!this.Data) return;

        var max=this.YClose;
        var min=this.YClose;

        for(var i in this.Data.Data)
        {
            if (this.Data.Data[i]==null) continue;
            if (max<this.Data.Data[i]) max=this.Data.Data[i];
            if (min>this.Data.Data[i]) min=this.Data.Data[i];
        }

        if (this.AverageData)
        {
            for(var i in this.AverageData.Data)
            {
                if (this.AverageData.Data[i]==null) continue;
                if (max<this.AverageData.Data[i]) max=this.AverageData.Data[i];
                if (min>this.AverageData.Data[i]) min=this.AverageData.Data[i];
            }
        }

        if (this.OverlayChartPaint && this.OverlayChartPaint.length>0 && this.OverlayChartPaint[0] && this.OverlayChartPaint[0].Symbol)
        {
            var range=this.OverlayChartPaint[0].GetMaxMin();
            if (range.Max && range.Max>max) max=range.Max;
            if (range.Min && range.Min<min) min=range.Min;
        }

        if (this.YClose==max && this.YClose==min)
        {
            max=this.YClose+this.YClose*0.1;
            min=this.YClose-this.YClose*0.1
        }
        else
        {
            var distanceValue=Math.max(Math.abs(this.YClose-max),Math.abs(this.YClose-min));
            max=this.YClose+distanceValue;
            min=this.YClose-distanceValue;
        }

        var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
        var width=this.Frame.ChartBorder.GetChartWidth();   //画布的宽度
        var isPhoneModel=width<450*pixelTatio;
        console.log('[FrameSplitMinutePriceY]'+ 'max='+ max + ' min='+ min +' isPhoneModel='+isPhoneModel);

        var showCount=this.SplitCount;
        var distance=(max-min)/(showCount-1);
        const minDistance=[1, 0.1, 0.01, 0.001, 0.0001];
        var defaultfloatPrecision=GetfloatPrecision(this.Symbol);
        if (isPhoneModel && MARKET_SUFFIX_NAME.IsSHSZIndex(this.Symbol)) defaultfloatPrecision = 0;    //手机端指数不显示小数位数,太长了
        if (distance<minDistance[defaultfloatPrecision]) 
        {
            distance=minDistance[defaultfloatPrecision];
            max=this.YClose+(distance*(showCount-1)/2);
            min=this.YClose-(distance*(showCount-1)/2);
        }

        for(var i=0;i<showCount;++i)
        {
            var price=min+(distance*i);
            this.Frame.HorizontalInfo[i]= new CoordinateInfo();
            this.Frame.HorizontalInfo[i].Value=price;
            this.Frame.HorizontalInfo[i].Message[0]=price.toFixed(defaultfloatPrecision);

            if (this.YClose)
            {
                var per=(price/this.YClose-1)*100;
                if (per>0) this.Frame.HorizontalInfo[i].TextColor=g_JSChartResource.UpTextColor;
                else if (per<0) this.Frame.HorizontalInfo[i].TextColor=g_JSChartResource.DownTextColor;
                this.Frame.HorizontalInfo[i].Message[1]=IFrameSplitOperator.FormatValueString(per,2)+'%'; //百分比
            }
        }

        this.Frame.HorizontalMax=max;
        this.Frame.HorizontalMin=min;
    }

}

function FrameSplitMinuteX()
{
    this.newMethod=IFrameSplitOperator;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ShowText=true;                 //是否显示坐标信息
    this.Symbol=null;                   //股票代码 x轴刻度根据股票类型来调整
    this.DayCount=1;
    this.ShowDateFormate=1;             //0=YYYY-MM-DD  1=MM-DD

    this.Operator=function()
    {
        this.Frame.VerticalInfo=[];
        var xPointCount=this.Frame.XPointCount;
        var width = this.Frame.ChartBorder.GetWidth();
        var isHScreen=(this.Frame.IsHScreen===true);
        if (isHScreen) width = this.Frame.ChartBorder.GetHeight();
        width=width/GetDevicePixelRatio();

        const minuteCoordinate = g_MinuteCoordinateData;
        var xcoordinateData = minuteCoordinate.GetCoordinateData(this.Symbol,width);
        var minuteCount=xcoordinateData.Count;
        var minuteMiddleCount=xcoordinateData.MiddleCount>0? xcoordinateData.MiddleCount: parseInt(minuteCount/2);
        var xcoordinate = xcoordinateData.Data;

        this.Frame.XPointCount=minuteCount*this.DayCount;
        this.Frame.MinuteCount=minuteCount;
        this.Frame.VerticalInfo=[];
        
        if (this.DayCount<=1)
        {
            for(var i in xcoordinate)
            {
                var info=new CoordinateInfo();
                info.Value=xcoordinate[i][0];
                if (this.ShowText)
                    info.Message[0]=xcoordinate[i][3];
                this.Frame.VerticalInfo[i]=info;
            }
        }
        else
        {
            for(var i=this.DayData.length-1,j=0;i>=0;--i,++j)
            {
                var info=new CoordinateInfo();
                info.Value=j*minuteCount+minuteMiddleCount;
                info.LineType=-1;    //线段不画
                if (this.ShowText) info.Message[0]=IFrameSplitOperator.FormatDateString(this.DayData[i].Date, this.ShowFormate==0?'YYYY-MM-DD':'MM-DD');
                this.Frame.VerticalInfo.push(info);

                var info=new CoordinateInfo();
                info.Value=(j+1)*minuteCount;
                this.Frame.VerticalInfo.push(info);
            }
        }
    }
}

function FrameSplitXData()
{
    this.newMethod=IFrameSplitOperator;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ShowText=true;                 //是否显示坐标信息

    this.Operator=function()
    {
        if (this.Frame.Data==null || this.Frame.XData==null) return;
        this.Frame.VerticalInfo=[];
        var xOffset=this.Frame.Data.DataOffset;
        var xPointCount=this.Frame.XPointCount;

        for(var i=0, index=xOffset; i<xPointCount && index<this.Frame.Data.Data.length ;++i,++index)
        {
            var info= new CoordinateInfo();
            info.Value=index-xOffset;
            
            if (this.ShowText)
                info.Message[0]=this.Frame.XData[i];

            this.Frame.VerticalInfo.push(info);
            distance=0;
        }
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////
//十字光标
function ChartCorssCursor()
{
    this.Frame;
    this.Canvas;                            //画布
    this.PenColor=g_JSChartResource.CorssCursorPenColor;        //十字线颜色
    this.Font=g_JSChartResource.CorssCursorTextFont;            //字体
    this.TextColor=g_JSChartResource.CorssCursorTextColor;      //文本颜色
    this.TextBGColor=g_JSChartResource.CorssCursorBGColor;      //文本背景色
    this.TextHeight=20;                                         //文本字体高度
    this.LastPoint;

    this.PointX;
    this.PointY;

    this.StringFormatX;
    this.StringFormatY;

    this.IsShowText=true;   //是否显示十字光标刻度
    this.IsShow=true;

    this.Draw=function()
    {
        if (!this.LastPoint) return;

        var x=this.LastPoint.X;
        var y=this.LastPoint.Y;

        var isInClient=false;
        this.Canvas.beginPath();
        this.Canvas.rect(this.Frame.ChartBorder.GetLeft(),this.Frame.ChartBorder.GetTop(),this.Frame.ChartBorder.GetWidth(),this.Frame.ChartBorder.GetHeight());
        isInClient=this.Canvas.isPointInPath(x,y);

        this.PointY=null;
        this.PointY==null;

        if (!isInClient) return;

        if (this.Frame.IsHScreen===true)
        {
            this.HScreenDraw();
            return;
        }

        var left=this.Frame.ChartBorder.GetLeft();
        var right=this.Frame.ChartBorder.GetRight();
        var top=this.Frame.ChartBorder.GetTopTitle();
        var bottom=this.Frame.ChartBorder.GetBottom();
        var rightWidth=this.Frame.ChartBorder.Right;
        var chartRight=this.Frame.ChartBorder.GetChartWidth();

        this.PointY=[[left,y],[right,y]];
        this.PointX=[[x,top],[x,bottom]];

        //十字线
        this.Canvas.save();
        this.Canvas.strokeStyle=this.PenColor;
        this.Canvas.setLineDash([3,2]);   //虚线
        //this.Canvas.lineWidth=0.5
        this.Canvas.beginPath();

        this.Canvas.moveTo(left,ToFixedPoint(y));
        this.Canvas.lineTo(right,ToFixedPoint(y));

        if (this.Frame.SubFrame.length>0)
        {
            for(var i in this.Frame.SubFrame)
            {
                var frame=this.Frame.SubFrame[i].Frame;
                top=frame.ChartBorder.GetTopTitle();
                bottom=frame.ChartBorder.GetBottom();
                this.Canvas.moveTo(ToFixedPoint(x),top);
                this.Canvas.lineTo(ToFixedPoint(x),bottom);
            }
        }
        else
        {
            this.Canvas.moveTo(ToFixedPoint(x),top);
            this.Canvas.lineTo(ToFixedPoint(x),bottom);
        }

        this.Canvas.stroke();
        this.Canvas.restore();

        var xValue=this.Frame.GetXData(x);
        var yValueExtend={};
        var yValue=this.Frame.GetYData(y,yValueExtend);

        this.StringFormatX.Value=xValue;
        this.StringFormatY.Value=yValue;
        this.StringFormatY.FrameID=yValueExtend.FrameID;

        //X轴
        if (this.IsShowText && this.StringFormatY.Operator() && (this.Frame.ChartBorder.Left>=30 || this.Frame.ChartBorder.Right>=30))
        {
            var text=this.StringFormatY.Text;
            this.Canvas.font=this.Font;
            var textWidth=this.Canvas.measureText(text).width+4;    //前后各空2个像素

            if (this.Frame.ChartBorder.Left>=30)
            {
                this.Canvas.fillStyle=this.TextBGColor;
                if (left<textWidth) //左边空白的地方太少了画布下
                {
                    this.Canvas.fillRect(2,y-this.TextHeight/2,textWidth,this.TextHeight);
                    this.Canvas.textAlign="left";
                    this.Canvas.textBaseline="middle";
                    this.Canvas.fillStyle=this.TextColor;
                    this.Canvas.fillText(text,2+2,y,textWidth);
                }
                else
                {
                    this.Canvas.fillRect(left-2,y-this.TextHeight/2,-textWidth,this.TextHeight);
                    this.Canvas.textAlign="right";
                    this.Canvas.textBaseline="middle";
                    this.Canvas.fillStyle=this.TextColor;
                    this.Canvas.fillText(text,left-4,y,textWidth);
                }
            }

            if (this.Frame.ChartBorder.Right>=30)
            {
                this.Canvas.fillStyle=this.TextBGColor;
                if (rightWidth<textWidth)   //右边空白显示不下, 
                {
                    this.Canvas.fillRect(chartRight-2-textWidth,y-this.TextHeight/2,textWidth,this.TextHeight);
                    this.Canvas.textAlign="right";
                    this.Canvas.textBaseline="middle";
                    this.Canvas.fillStyle=this.TextColor;
                    this.Canvas.fillText(text,chartRight-4,y,textWidth);
                }
                else
                {
                    this.Canvas.fillRect(right+2,y-this.TextHeight/2,textWidth,this.TextHeight);
                    this.Canvas.textAlign="left";
                    this.Canvas.textBaseline="middle";
                    this.Canvas.fillStyle=this.TextColor;
                    this.Canvas.fillText(text,right+4,y,textWidth);
                }
            }
        }

        if (this.IsShowText && this.StringFormatX.Operator())
        {
            var text=this.StringFormatX.Text;
            this.Canvas.font=this.Font;

            this.Canvas.fillStyle=this.TextBGColor;
            var textWidth=this.Canvas.measureText(text).width+4;    //前后各空2个像素
            var yCenter=bottom+2+this.TextHeight/2;
            //console.log('[ChartCorssCursor::Draw] ',yCenter);
            if (x-textWidth/2<3)    //左边位置不够了, 顶着左边画
            {
                this.Canvas.fillRect(x-1,bottom+2,textWidth,this.TextHeight);
                this.Canvas.textAlign="left";
                this.Canvas.textBaseline="middle";
                this.Canvas.fillStyle=this.TextColor;
                this.Canvas.fillText(text,x+1,yCenter,textWidth);
            }
            else if (x+textWidth/2>=right)
            {
                this.Canvas.fillRect(right-textWidth,bottom+2,textWidth,this.TextHeight);
                this.Canvas.textAlign="right";
                this.Canvas.textBaseline="middle";
                this.Canvas.fillStyle=this.TextColor;
                this.Canvas.fillText(text,right-2,yCenter,textWidth);
            }
            else
            {
                this.Canvas.fillRect(x-textWidth/2,bottom+2,textWidth,this.TextHeight);
                this.Canvas.textAlign="center";
                this.Canvas.textBaseline="middle";
                this.Canvas.fillStyle=this.TextColor;
                this.Canvas.fillText(text,x,yCenter,textWidth);
            }
        }
    }

    this.HScreenDraw=function()
    {
        var x=this.LastPoint.X;
        var y=this.LastPoint.Y;

        var left=this.Frame.ChartBorder.GetLeft();
        var right=this.Frame.ChartBorder.GetRightEx();
        var top=this.Frame.ChartBorder.GetTop();
        var bottom=this.Frame.ChartBorder.GetBottom();
        var bottomWidth=this.Frame.ChartBorder.Bottom;

        this.PointY=[[left,y],[right,y]];
        this.PointX=[[x,top],[x,bottom]];

        //十字线
        this.Canvas.save();
        this.Canvas.strokeStyle=this.PenColor;
        this.Canvas.setLineDash([3,2]);   //虚线
        //this.Canvas.lineWidth=0.5
        this.Canvas.beginPath();

        //画竖线
        this.Canvas.moveTo(ToFixedPoint(x),top);
        this.Canvas.lineTo(ToFixedPoint(x),bottom);

        //画横线
        if (this.Frame.SubFrame.length>0)
        {
            for(var i in this.Frame.SubFrame)
            {
                var frame=this.Frame.SubFrame[i].Frame;
                this.Canvas.moveTo(frame.ChartBorder.GetLeft(),ToFixedPoint(y));
                this.Canvas.lineTo(frame.ChartBorder.GetRightTitle(),ToFixedPoint(y));
            }
        }
        else
        {
            this.Canvas.moveTo(left,ToFixedPoint(y));
            this.Canvas.lineTo(right,ToFixedPoint(y));
        }

        this.Canvas.stroke();
        this.Canvas.restore();

        var xValue=this.Frame.GetXData(y);
        var yValueExtend={};
        var yValue=this.Frame.GetYData(x,yValueExtend);

        this.StringFormatX.Value=xValue;
        this.StringFormatY.Value=yValue;
        this.StringFormatY.FrameID=yValueExtend.FrameID;

        if (this.IsShowText && this.StringFormatY.Operator() && (this.Frame.ChartBorder.Top>=30 || this.Frame.ChartBorder.Bottom>=30))
        {
            var text=this.StringFormatY.Text;
            this.Canvas.font=this.Font;
            var textWidth=this.Canvas.measureText(text).width+4;    //前后各空2个像素

            if (this.Frame.ChartBorder.Top>=30)
            {
                var xText=x;
                var yText=top;
                this.Canvas.save();
                this.Canvas.translate(xText, yText);
                this.Canvas.rotate(90 * Math.PI / 180); //数据和框子旋转180度
                
                this.Canvas.fillStyle=this.TextBGColor;
                if (top>=textWidth)
                {
                    this.Canvas.fillRect(0,-(this.TextHeight/2),-textWidth,this.TextHeight);
                    this.Canvas.textAlign="right";
                    this.Canvas.textBaseline="middle";
                    this.Canvas.fillStyle=this.TextColor;
                    this.Canvas.fillText(text,-2,0,textWidth);
                }
                else
                {
                    this.Canvas.fillRect((textWidth-top),-(this.TextHeight/2),-textWidth,this.TextHeight);
                    this.Canvas.textAlign="right";
                    this.Canvas.textBaseline="middle";
                    this.Canvas.fillStyle=this.TextColor;
                    this.Canvas.fillText(text,(textWidth-top)-2,0,textWidth);
                }

                this.Canvas.restore();
            }

            if (this.Frame.ChartBorder.Bottom>=30)
            {
                var xText=x;
                var yText=bottom;
                this.Canvas.save();
                this.Canvas.translate(xText, yText);
                this.Canvas.rotate(90 * Math.PI / 180); //数据和框子旋转180度
                
                this.Canvas.fillStyle=this.TextBGColor;
                if (bottomWidth>textWidth)
                {
                    this.Canvas.fillRect(0,-(this.TextHeight/2),textWidth,this.TextHeight);
                    this.Canvas.textAlign="left";
                    this.Canvas.textBaseline="middle";
                    this.Canvas.fillStyle=this.TextColor;
                    this.Canvas.fillText(text,2,0,textWidth);
                }
                else
                {
                    this.Canvas.fillRect((bottomWidth-textWidth),-(this.TextHeight/2),textWidth,this.TextHeight);
                    this.Canvas.textAlign="left";
                    this.Canvas.textBaseline="middle";
                    this.Canvas.fillStyle=this.TextColor;
                    this.Canvas.fillText(text,(bottomWidth-textWidth)+2,0,textWidth);
                }

                this.Canvas.restore();
            }
        }

        if (this.IsShowText && this.StringFormatX.Operator())
        {
            var text=this.StringFormatX.Text;
            this.Canvas.font=this.Font;

            this.Canvas.fillStyle=this.TextBGColor;
            var textWidth=this.Canvas.measureText(text).width+4;    //前后各空2个像素
            if (y-textWidth/2<3)    //左边位置不够了, 顶着左边画
            {
                var xText=left;
                var yText=y;
                this.Canvas.save();
                this.Canvas.translate(xText, yText);
                this.Canvas.rotate(90 * Math.PI / 180); //数据和框子旋转180度

                this.Canvas.fillRect(0,0,textWidth,this.TextHeight);
                this.Canvas.textAlign="left";
                this.Canvas.textBaseline="middle";
                this.Canvas.fillStyle=this.TextColor;
                this.Canvas.fillText(text,0,this.TextHeight/2,textWidth);

                this.Canvas.restore();
            }
            else
            {
                var xText=left;
                var yText=y;

                this.Canvas.save();
                this.Canvas.translate(xText, yText);
                this.Canvas.rotate(90 * Math.PI / 180); //数据和框子旋转180度

                this.Canvas.fillRect(-textWidth/2,0,textWidth,this.TextHeight);
                this.Canvas.textAlign="center";
                this.Canvas.textBaseline="middle";
                this.Canvas.fillStyle=this.TextColor;
                this.Canvas.fillText(text,0,this.TextHeight/2,textWidth);

                this.Canvas.restore();
            }
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
// 等待提示
function ChartSplashPaint()
{
    this.Frame;
    this.Canvas;                            //画布
    this.Font=g_JSChartResource.DefaultTextFont;            //字体
    this.TextColor=g_JSChartResource.DefaultTextColor;      //文本颜色
    this.IsEnableSplash=false;
    this.SplashTitle='数据加载中';

    this.Draw=function()
    {
        if (!this.IsEnableSplash) return;

        if (this.Frame.IsHScreen===true)
        {
            this.HScreenDraw();
            return;
        }

        var xCenter = (this.Frame.ChartBorder.GetLeft() + this.Frame.ChartBorder.GetRight()) / 2;
        var yCenter = (this.Frame.ChartBorder.GetTop() + this.Frame.ChartBorder.GetBottom()) / 2;
        this.Canvas.textAlign='center';
        this.Canvas.textBaseline='middle';
        this.Canvas.fillStyle=this.TextColor;
        this.Canvas.font=this.Font;
        this.Canvas.fillText(this.SplashTitle,xCenter,yCenter);
    }

    this.HScreenDraw=function() //横屏
    {
        var xCenter = (this.Frame.ChartBorder.GetLeft() + this.Frame.ChartBorder.GetRight()) / 2;
        var yCenter = (this.Frame.ChartBorder.GetTop() + this.Frame.ChartBorder.GetBottom()) / 2;

        this.Canvas.save();
        this.Canvas.translate(xCenter, yCenter);
        this.Canvas.rotate(90 * Math.PI / 180); //数据和框子旋转180度

        this.Canvas.textAlign='center';
        this.Canvas.textBaseline='middle';
        this.Canvas.fillStyle=this.TextColor;
        this.Canvas.font=this.Font;
        this.Canvas.fillText(this.SplashTitle,0,0);

        this.Canvas.restore();
    }
}

/////////////////////////////////////////////////////////////////////////////////
//
function IChangeStringFormat()
{
    this.Data;
    this.Value;     //数据
    this.Text;      //输出字符串

    this.Operator=function()
    {
        return false;
    }
}


function HQPriceStringFormat()
{
    this.newMethod=IChangeStringFormat;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Symbol;
    this.FrameID;

    this.Operator=function()
    {
        if (!this.Value) return false;

        var defaultfloatPrecision=2;     //价格小数位数 
        if (this.FrameID==0)    //第1个窗口显示原始价格
        {
            var defaultfloatPrecision=GetfloatPrecision(this.Symbol);
            this.Text=this.Value.toFixed(defaultfloatPrecision);
        }
        else
        {
            this.Text=IFrameSplitOperator.FormatValueString(this.Value,defaultfloatPrecision);
        }

        return true;
    }
}

function HQDateStringFormat()
{
    this.newMethod=IChangeStringFormat;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Operator=function()
    {
        if (!this.Value) return false;
        if (!this.Data) return false;

        var index=Math.abs(this.Value-0.5);
        index=parseInt(index.toFixed(0));
        if (this.Data.DataOffset+index>=this.Data.Data.length) return false;
        var currentData = this.Data.Data[this.Data.DataOffset+index];
        this.Text=IFrameSplitOperator.FormatDateString(currentData.Date);
        if (this.Data.Period >= 4) // 分钟周期
        {
            var time = IFrameSplitOperator.FormatTimeString(currentData.Time);
            this.Text = this.Text + "  " + time;
        }

        return true;
    }
}

function HQMinuteTimeStringFormat()
{
    this.newMethod=IChangeStringFormat;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Frame;
    this.Symbol;

    this.Operator=function()
    {
        if (this.Value==null || isNaN(this.Value)) return false;
        
        var index=Math.abs(this.Value);
        index=parseInt(index.toFixed(0));
        var showIndex=index;
        if (this.Frame && this.Frame.MinuteCount) showIndex=index%this.Frame.MinuteCount;

        var timeStringData=g_MinuteTimeStringData;
        var timeData=timeStringData.GetTimeData(this.Symbol);
        if (!timeData) return false;

        if (showIndex<0) showIndex=0;
        else if (showIndex>timeData.length) showIndex=timeData.length-1;
        if (this.Frame && index>=this.Frame.XPointCount) 
            showIndex=timeData.length-1;

        var time=timeData[showIndex];
        this.Text=IFrameSplitOperator.FormatTimeString(time);
        return true;
    }
}


//行情tooltip提示信息格式
var WEEK_NAME=["日","一","二","三","四","五","六"];
function HistoryDataStringFormat()
{
    this.newMethod=IChangeStringFormat;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Symbol;
    this.UpColor=g_JSChartResource.UpTextColor;
    this.DownColor=g_JSChartResource.DownTextColor;
    this.UnchagneColor=g_JSChartResource.UnchagneTextColor;

    this.VolColor=g_JSChartResource.DefaultTextColor;
    this.AmountColor=g_JSChartResource.DefaultTextColor;

    this.Operator=function()
    {
        var data=this.Value.Data;
        if (!data) return false;

        var date=new Date(parseInt(data.Date/10000),(data.Date/100%100-1),data.Date%100);
        var strDate=IFrameSplitOperator.FormatDateString(data.Date);
        var title2=WEEK_NAME[date.getDay()];
        if (this.Value.ChartPaint.Data.Period >= 4) // 分钟周期
        {
            var hour=parseInt(data.Time/100);
            var minute=data.Time%100;
            var strHour=hour>=10?hour.toString():"0"+hour.toString();
            var strMinute=minute>=10?minute.toString():"0"+minute.toString();
            title2 = strHour + ":" + strMinute;
        }
        var defaultfloatPrecision=GetfloatPrecision(this.Symbol);//价格小数位数
        var increase=(data.Close-data.YClose)/data.YClose*100;
        var strText=
            "<span class='tooltip-title'>"+strDate+"&nbsp&nbsp"+title2+"</span>"+
            "<span class='tooltip-con'>开盘:</span>"+
            "<span class='tooltip-num' style='color:"+this.GetColor(data.Open,data.YClose)+";'>"+data.Open.toFixed(defaultfloatPrecision)+"</span><br/>"+
            "<span class='tooltip-con'>最高:</span>"+
            "<span class='tooltip-num' style='color:"+this.GetColor(data.High,data.YClose)+";'>"+data.High.toFixed(defaultfloatPrecision)+"</span><br/>"+
            "<span class='tooltip-con'>最低:</span>"+
            "<span class='tooltip-num' style='color:"+this.GetColor(data.Low,data.YClose)+";'>"+data.Low.toFixed(defaultfloatPrecision)+"</span><br/>"+
            "<span class='tooltip-con'>收盘:</span>"+
            "<span class='tooltip-num' style='color:"+this.GetColor(data.Close,data.YClose)+";'>"+data.Close.toFixed(defaultfloatPrecision)+"</span><br/>"+
            //"<span style='color:"+this.YClose+";font:微软雅黑;font-size:12px'>&nbsp;前收: "+IFrameSplitOperator.FormatValueString(data.YClose,2)+"</span><br/>"+
            "<span class='tooltip-con'>数量:</span>"+
            "<span class='tooltip-num' style='color:"+this.VolColor+";'>"+IFrameSplitOperator.FormatValueString(data.Vol,2)+"</span><br/>"+
            "<span class='tooltip-con'>金额:</span>"+
            "<span class='tooltip-num' style='color:"+this.AmountColor+";'>"+IFrameSplitOperator.FormatValueString(data.Amount,2)+"</span><br/>"+
            "<span class='tooltip-con'>涨幅:</span>"+
            "<span class='tooltip-num' style='color:"+this.GetColor(increase,0)+";'>"+increase.toFixed(2)+'%'+"</span><br/>";;

        //叠加股票
        if (this.Value.ChartPaint.Name=="Overlay-KLine")
        {
            var title="<span style='color:rgb(0,0,0);font:微软雅黑;font-size:12px;text-align:center;display: block;'>"+this.Value.ChartPaint.Title+"</span>";
            strText=title+strText;
        }

        this.Text=strText;
        return true;
    }

    this.GetColor=function(price,yclse)
    {
        if(price>yclse) return this.UpColor;
        else if (price<yclse) return this.DownColor;
        else return this.UnchagneColor;
    }
}

//K线信息地雷提示信息格式
function KLineInfoDataStringFormat()
{
    this.newMethod=IChangeStringFormat;   //派生
    this.newMethod();
    delete this.newMethod;

    this.UpColor=g_JSChartResource.UpTextColor;
    this.DownColor=g_JSChartResource.DownTextColor;
    this.UnchagneColor=g_JSChartResource.UnchagneTextColor;

    this.Operator=function()
    {
        if (!this.Value) return false;

        var infoList=this.Value.Data.Data;  //数据
        var infoType=this.Value.Data.Type;  //类型
        var strText='';

        for(var i in infoList)
        {
            var item=infoList[i];
            var tempText='';
            switch(infoType)
            {
                case KLINE_INFO_TYPE.BLOCKTRADING:
                    tempText=this.BlockTradingFormat(item);
                    break;
                case KLINE_INFO_TYPE.TRADEDETAIL:
                    tempText=this.TradeDetailFormat(item);
                    break;
                case KLINE_INFO_TYPE.RESEARCH:
                    tempText=this.ResearchFormat(item);
                    break;
                case KLINE_INFO_TYPE.PFORECAST:
                    tempText=this.PerformanceForecastFormat(item);
                    break;
                default:
                    tempText=this.DefaultFormat(item);
                    break;
            }

            strText+=tempText;
        }

        var html="<div class='title-length'>"+strText+"</div>";

        if(infoList.length > 8)
        {
            var strBox="<div class='total-list'>共"+infoList.length+"条</div>";
            html+=strBox;
        }

        this.Text=html;
        return true;
    }

    this.DefaultFormat=function(item)
    {
        var strDate=IFrameSplitOperator.FormatDateString(item.Date);
        var strText="<span>"+strDate+"&nbsp;&nbsp;&nbsp;"+item.Title+"</span>";
        return strText;
    }

    //大宗交易
    this.BlockTradingFormat=function(item)
    {
        var showPriceInfo = item.ExtendData;
        var strDate=IFrameSplitOperator.FormatDateString(item.Date);
        var strText="<span><i class='date-tipbox'>"+strDate+"</i>&nbsp;&nbsp;<i class='tipBoxTitle'>成交价:&nbsp;"+showPriceInfo.Price.toFixed(2)+"</i><i class='tipBoxTitle'>收盘价:&nbsp;"+showPriceInfo.ClosePrice.toFixed(2)+
            "</i><br/><i class='rate-discount tipBoxTitle'>溢折价率:&nbsp;<strong style='color:"+ this.GetColor(showPriceInfo.Premium.toFixed(2))+"'>"+
            showPriceInfo.Premium.toFixed(2)+"%</strong></i><i class='tipBoxTitle'>成交量(万股):&nbsp;"+showPriceInfo.Vol.toFixed(2)+"</i></span>";

        return strText;
    }

    //龙虎榜
    this.TradeDetailFormat=function(item)
    {
        /*var detail=
            [
                "日价格涨幅偏离值达到9.89%",
                "日价格涨幅偏离值达格涨幅偏离值达格涨幅偏离值达到9.89%"
            ]
        */

        var detail=item.ExtendData.Detail;
        //格式：日期 上榜原因:  detail[0].TypeExplain
        //                    detail[1].TypeExplain
        //      一周后涨幅: xx 四周后涨幅: xx
        var strDate=IFrameSplitOperator.FormatDateString(item.Date);
        var reasons = [];
        for(var i in detail)
        {
            reasons += "<i>"+detail[i].TypeExplain+"</i><br/>"
            // reasons += detail[i] + "<br/>"
        }

        var strText= "<span><i class='trade-time'>"+strDate+"&nbsp;&nbsp;&nbsp;上榜原因:&nbsp;&nbsp;</i><i class='reason-list'>"+reasons+"</i><br/><i class='trade-detall'>一周后涨幅:&nbsp;<strong style='color:"+
            this.GetColor(item.ExtendData.FWeek.Week1.toFixed(2))+"'>"+ item.ExtendData.FWeek.Week1.toFixed(2)+
            "%</strong>&nbsp;&nbsp;&nbsp;四周后涨幅:&nbsp;<strong style='color:"+this.GetColor(item.ExtendData.FWeek.Week4.toFixed(2))+";'>"+
            item.ExtendData.FWeek.Week4.toFixed(2)+"%</strong></i></span>";

        return strText;
    }

    //调研
    this.ResearchFormat=function(item)
    {
        var levels=item.ExtendData.Level;
        var recPerson=[];
        if(levels.length==0)
        {
            recPerson = "<i>无</i>"
        }else
        {
            for(var j in levels)
            {
                if(levels[j]==0) recPerson+="<i style='color:#00a0e9'>证券代表&nbsp;&nbsp;&nbsp;</i>";
                else if(levels[j]==1) recPerson+="<i>董秘&nbsp;&nbsp;&nbsp;</i>";
                else if(levels[j]==2) recPerson+="<i style='color:#00a0e9'>总经理&nbsp;&nbsp;&nbsp;</i>";
                else if(levels[j]==3) recPerson+="<i style='color:#00a0e9'>董事长&nbsp;&nbsp;&nbsp;</i>";
            }
        }
        var strDate=IFrameSplitOperator.FormatDateString(item.Date);
        var strText="<span>"+strDate+"&nbsp;&nbsp;&nbsp;接待:&nbsp;&nbsp;&nbsp;"+recPerson+"</span>";
        return strText;
    }

    //业绩预测
    this.PerformanceForecastFormat=function(item)
    {
        var reportDate=item.ExtendData.ReportDate;
        var year=parseInt(reportDate/10000);  //年份
        var day=reportDate%10000;   //比较 这个去掉年份的日期
        var reportType;
        if(day == 1231){
            reportType = "年报"
        }else if(day == 331){
            reportType = "一季度报"
        }else if(day == 630){
            reportType = "半年度报"
        }else if(day == 930){
            reportType = "三季度报"
        }

        var weekData="";
        if (item.ExtendData.FWeek)
        {
            if (item.ExtendData.FWeek.Week1!=null) weekData+="一周后涨幅:<i class='increase' style='color:"+this.GetColor(item.ExtendData.FWeek.Week1.toFixed(2))+"'>"+ item.ExtendData.FWeek.Week1.toFixed(2)+"%</i>";
            if (item.ExtendData.FWeek.Week4!=null) weekData+="&nbsp;四周后涨幅:<i class='increase' style='color:"+this.GetColor(item.ExtendData.FWeek.Week4.toFixed(2))+"'>"+ item.ExtendData.FWeek.Week4.toFixed(2)+"%</i>";
            if (weekData.length>0) weekData="<br/>&nbsp;&nbsp;<i class='prorecast-week'>"+weekData+"</i>";
        }
        var strDate=IFrameSplitOperator.FormatDateString(item.Date);
        var strText="<span>"+strDate+"&nbsp;&nbsp;"+year+reportType+item.Title+"&nbsp;"+weekData+"</span>";
        return strText;
    }

    this.GetColor=function(price)
    {
        if(price>0) return this.UpColor;
        else if (price<0) return this.DownColor;
        else return this.UnchagneColor;
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                      标题
//
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function IChartTitlePainting()
{
    this.Frame;
    this.Data=new Array();
    this.Canvas;                        //画布
    this.IsDynamic=false;               //是否是动态标题
    this.Position=0;                    //标题显示位置 0 框架里的标题  1 框架上面
    this.CursorIndex;                   //数据索引
    this.Font=g_JSChartResource.TitleFont;
    this.Title;                         //固定标题(可以为空)
    this.TitleColor=g_JSChartResource.DefaultTextColor;
}

var PERIOD_NAME=["日线","周线","月线","年线","1分","5分","15分","30分","60分","",""];
var RIGHT_NAME=['不复权','前复权','后复权'];

function DynamicKLineTitlePainting()
{
    this.newMethod=IChartTitlePainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.IsDynamic=true;
    this.IsShow=true;       //是否显示

    this.UpColor=g_JSChartResource.UpTextColor;
    this.DownColor=g_JSChartResource.DownTextColor;
    this.UnchagneColor=g_JSChartResource.UnchagneTextColor;

    this.VolColor=g_JSChartResource.DefaultTextColor;
    this.AmountColor=g_JSChartResource.DefaultTextColor;

    this.Symbol;
    this.Name;

    this.SpaceWidth=2*GetDevicePixelRatio(); //获取设备的分辨率;
    this.OverlayChartPaint;         //叠加画法

    this.IsShowName=true;           //是否显示股票名称
    this.IsShowSettingInfo=true;    //是否显示设置信息(周期 复权)
    this.IsShowDateTime=true;       //是否显示日期

    this.DrawItem=function(item)
    {
        var isHScreen=this.Frame.IsHScreen===true;
        var left=this.Frame.ChartBorder.GetLeft();
        var bottom=this.Frame.ChartBorder.GetTop()-this.Frame.ChartBorder.Top/2;
        var right=this.Frame.ChartBorder.GetRight();
        var defaultfloatPrecision=GetfloatPrecision(this.Symbol);//价格小数位数

        if (isHScreen)
        {
            if (this.Frame.ChartBorder.Right<5) return;
            var left=2;
            var bottom=this.Frame.ChartBorder.Right/2;    //上下居中显示
            var right=this.Frame.ChartBorder.GetHeight();
            var xText=this.Frame.ChartBorder.GetChartWidth();
            var yText=this.Frame.ChartBorder.GetTop();
            this.Canvas.translate(xText, yText);
            this.Canvas.rotate(90 * Math.PI / 180);
        }
        else
        {
            if (this.Frame.ChartBorder.Top<5) return;
        }

        this.Canvas.textAlign="left";
        this.Canvas.textBaseline="middle";
        this.Canvas.font=this.Font;
        var position = { Left: left, Bottom: bottom, IsHScreen: isHScreen };

        if (this.IsShowName)
        {
            if (!this.DrawText(this.Name,this.UnchagneColor,position)) return;
        }

        if (this.IsShowSettingInfo)
        {
            this.Canvas.fillStyle=this.UnchagneColor;
            var periodName=PERIOD_NAME[this.Data.Period];
            var rightName=RIGHT_NAME[this.Data.Right];
            var text="("+periodName+" "+rightName+")";
            var isIndex=IsIndexSymbol(this.Symbol); //是否是指数
            if(item.Time!=null || isIndex)  text="("+periodName+")";           //分钟K线 指数 没有复权
            if (!this.DrawText(text,this.UnchagneColor,position)) return;
        }

        if (this.IsShowDateTime)    //是否显示日期
        {
            this.Canvas.fillStyle=this.UnchagneColor;
            var text=IFrameSplitOperator.FormatDateString(item.Date);
            if (!this.DrawText(text,this.UnchagneColor,position)) return;
        }

        if(item.Time!=null && !isNaN(item.Time) && item.Time>0)
        {
            var text=IFrameSplitOperator.FormatTimeString(item.Time);
            if (!this.DrawText(text,this.UnchagneColor,position)) return;
        }

        var color=this.GetColor(item.Open,item.YClose);
        var text="开:"+item.Open.toFixed(defaultfloatPrecision);
        if (!this.DrawText(text,color,position)) return;

        var color=this.GetColor(item.High,item.YClose);
        var text="高:"+item.High.toFixed(defaultfloatPrecision);
        if (!this.DrawText(text,color,position)) return;

        var color=this.GetColor(item.Low,item.YClose);
        var text="低:"+item.Low.toFixed(defaultfloatPrecision);
        if (!this.DrawText(text,color,position)) return;

        var color=this.GetColor(item.Close,item.YClose);
        var text="收:"+item.Close.toFixed(defaultfloatPrecision);
        if (!this.DrawText(text,color,position)) return;

        var value=(item.Close-item.YClose)/item.YClose*100;
        var color = this.GetColor(value, 0);
        var text = "幅:" + value.toFixed(2)+'%';
        if (!this.DrawText(text,color,position)) return;

        var text="量:"+IFrameSplitOperator.FormatValueString(item.Vol,2);
        if (!this.DrawText(text,this.VolColor,position)) return;

        var text="额:"+IFrameSplitOperator.FormatValueString(item.Amount,2);
        if (!this.DrawText(text,this.AmountColor,position)) return;

        //叠加股票的名字
        if (this.OverlayChartPaint && this.OverlayChartPaint[0] && this.OverlayChartPaint[0].Symbol && this.OverlayChartPaint[0].Title)
        {
            var name=this.OverlayChartPaint[0].Title;
            var clrText=this.OverlayChartPaint[0].Color;
            var text='['+name+']';
            if (!this.DrawText(text,clrText,position)) return;
        }
    }

    this.Draw=function()
    {
        if (!this.IsShow) return;
        if (this.CursorIndex==null || !this.Data) return;
        if (this.Data.length<=0) return;
        this.SpaceWidth = this.Canvas.measureText(' ').width;

        var index=Math.abs(this.CursorIndex-0.5);
        index=parseInt(index.toFixed(0));
        var dataIndex=this.Data.DataOffset+index;
        if (dataIndex>=this.Data.Data.length) dataIndex=this.Data.Data.length-1;
        if (dataIndex<0) return;

        var item=this.Data.Data[dataIndex];
        this.Canvas.save();
        this.DrawItem(item);
        this.Canvas.restore();
    }

    this.GetColor=function(price,yclse)
    {
        if(price>yclse) return this.UpColor;
        else if (price<yclse) return this.DownColor;
        else return this.UnchagneColor;
    }

    this.DrawText=function(title,color,position)
    {
        if (!title) return true;

        var isHScreen=this.Frame.IsHScreen===true;
        var right = this.Frame.ChartBorder.GetRight();
        if (isHScreen) right=this.Frame.ChartBorder.GetHeight();

        this.Canvas.fillStyle = color;
        var textWidth = this.Canvas.measureText(title).width;
        if (position.Left + textWidth > right) return false;
        this.Canvas.fillText(title, position.Left, position.Bottom, textWidth);

        position.Left += textWidth + this.SpaceWidth;
        return true;
    }

}

function DynamicMinuteTitlePainting()
{
    this.newMethod=DynamicKLineTitlePainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.SpaceWidth=1*GetDevicePixelRatio();
    this.YClose;
    this.IsShowDate=false;  //标题是否显示日期
    this.IsShowName=true;   //标题是否显示股票名字
    this.OverlayChartPaint; //叠加画法

    this.DrawItem=function(item)
    {
        var isHScreen=this.Frame.IsHScreen===true;
        var left=this.Frame.ChartBorder.GetLeft();
        var bottom=this.Frame.ChartBorder.GetTop()-this.Frame.ChartBorder.Top/2;
        var right=this.Frame.ChartBorder.GetRight();
        var defaultfloatPrecision=GetfloatPrecision(this.Symbol);//价格小数位数

        if (isHScreen)
        {
            if (this.Frame.ChartBorder.Right<5) return;
            var left=2;
            var bottom=this.Frame.ChartBorder.Right/2;    //上下居中显示
            var right=this.Frame.ChartBorder.GetHeight();
            var xText=this.Frame.ChartBorder.GetChartWidth();
            var yText=this.Frame.ChartBorder.GetTop();
            this.Canvas.translate(xText, yText);
            this.Canvas.rotate(90 * Math.PI / 180);
        }
        else
        {
            if (this.Frame.ChartBorder.Top<5) return;
        }

        this.Canvas.textAlign="left";
        this.Canvas.textBaseline="middle";
        this.Canvas.font=this.Font;
        var position = { Left: left, Bottom: bottom, IsHScreen: isHScreen };
        if(this.IsShowName)
        {
            if (!this.DrawText(this.Name,this.UnchagneColor,position)) return;
        }

        var text=IFrameSplitOperator.FormatDateTimeString(item.DateTime,this.IsShowDate);
        if (!this.DrawText(text,this.UnchagneColor,position)) return;

        if (item.Close)
        {
            var color=this.GetColor(item.Close,this.YClose);
            var text="价:"+item.Close.toFixed(defaultfloatPrecision);
            if (!this.DrawText(text,color,position)) return;
        }

        if (item.Increase!=null)
        {
            var color=this.GetColor(item.Increase,0);
            var text="幅:"+item.Increase.toFixed(2)+'%';
            if (!this.DrawText(text,color,position)) return;
        }

        if (item.AvPrice)
        {
            var color=this.GetColor(item.AvPrice,this.YClose);
            var text="均:"+item.AvPrice.toFixed(defaultfloatPrecision);
            if (!this.DrawText(text,color,position)) return;
        }

        var text="量:"+IFrameSplitOperator.FormatValueString(item.Vol,2);
        if (!this.DrawText(text,this.VolColor,position)) return;

        var text="额:"+IFrameSplitOperator.FormatValueString(item.Amount,2);
        if (!this.DrawText(text,this.AmountColor,position)) return;

        //叠加股票的名字
        if (this.OverlayChartPaint && this.OverlayChartPaint[0] && this.OverlayChartPaint[0].Symbol && this.OverlayChartPaint[0].Title)
        {
            var name=this.OverlayChartPaint[0].Title;
            var clrText=this.OverlayChartPaint[0].Color;
            var text='['+name+']';
            if (!this.DrawText(text,clrText,position)) return;
        }
    }

    this.Draw=function()
    {
        if (!this.IsShow) return;
        if (this.CursorIndex==null || !this.Data || !this.Data.Data) return;
        if (this.Data.Data.length<=0) return;

        this.SpaceWidth = this.Canvas.measureText(' ').width;

        //var index=Math.abs(this.CursorIndex-0.5);
        var index=this.CursorIndex;
        index=parseInt(index.toFixed(0));
        var dataIndex=index+this.Data.DataOffset;
        if (dataIndex>=this.Data.Data.length) dataIndex=this.Data.Data.length-1;

        var item=this.Data.Data[dataIndex];

        this.Canvas.save();
        this.DrawItem(item);
        this.Canvas.restore();
    }
}

//字符串输出格式
var STRING_FORMAT_TYPE =
{
    DEFAULT: 1,     //默认 2位小数 单位自动转化 (万 亿)
    THOUSANDS:21,   //千分位分割
};

function DynamicTitleData(data,name,color)
{
    this.Data=data;
    this.Name=name;
    this.Color=color;   //字体颜色
    this.DataType;      //数据类型
    this.StringFormat=STRING_FORMAT_TYPE.DEFAULT;   //字符串格式
    this.FloatPrecision=2;                          //小数位数
}

function DynamicChartTitlePainting()
{
    this.newMethod=IChartTitlePainting;   //派生
    this.newMethod();
    delete this.newMethod;

    this.IsDynamic=true;
    this.Data=new Array();
    this.Explain;
    this.ColorIndex;    //五彩K线名字 {Name:'名字'}
    this.TradeIndex;    //专家系统名字{Name:'名字'}

    this.FormatValue=function(value,item)
    {
        if (item.StringFormat==STRING_FORMAT_TYPE.DEFAULT)
            return IFrameSplitOperator.FormatValueString(value,item.FloatPrecision);
        else if (item.StringFormat=STRING_FORMAT_TYPE.THOUSANDS)
            return IFrameSplitOperator.FormatValueThousandsString(value,item.FloatPrecision);
    }

    this.FormatMultiReport=function(data,format)
    {
        var text="";
        for(var i in data)
        {
            var item = data[i];
            let quarter=item.Quarter;
            let year=item.Year;
            let value=item.Value;

            if (text.length>0) text+=',';

            text+=year.toString();
            switch(quarter)
            {
                case 1:
                    text+='一季报 ';
                    break;
                case 2:
                    text+='半年报 ';
                    break;
                case 3:
                    text+='三季报 ';
                    break;
                case 4:
                    text+='年报 ';
                    break;
            }

            text+=this.FormatValue(value,format);
        }

        return text;
    }

    this.Draw=function()
    {
        if (this.CursorIndex==null ) return;
        if (!this.Data) return;
        if (this.Frame.ChartBorder.TitleHeight<5) return;

        if (this.Frame.IsHScreen===true)
        {
            this.Canvas.save();
            this.HScreenDraw();
            this.Canvas.restore();
            return;
        }

        var left=this.Frame.ChartBorder.GetLeft()+1;
        var bottom=this.Frame.ChartBorder.GetTop()+this.Frame.ChartBorder.TitleHeight/2;    //上下居中显示
        var right=this.Frame.ChartBorder.GetRight();

        this.Canvas.textAlign="left";
        this.Canvas.textBaseline="middle";
        this.Canvas.font=this.Font;

        if (this.Title)
        {
            this.Canvas.fillStyle=this.TitleColor;
            var textWidth=this.Canvas.measureText(this.Title).width+2;
            this.Canvas.fillText(this.Title,left,bottom,textWidth);
            left+=textWidth;
        }

        for(var i in this.Data)
        {
            var item=this.Data[i];
            if (!item || !item.Data || !item.Data.Data || !item.Name) continue;

            if (item.Data.Data.length<=0) continue;

            var value=null;
            var valueText=null;
            if (item.DataType=="StraightLine")  //直线只有1个数据
            {
                value=item.Data.Data[0];
                valueText=this.FormatValue(value,item);
            }
            else
            {
                var index=Math.abs(this.CursorIndex-0.5);
                index=parseInt(index.toFixed(0));
                var dataIndex=item.Data.DataOffset+index;
                if (dataIndex>=item.Data.Data.length) dataIndex=item.Data.Data.length-1;
                if (dataIndex<0) continue;
                //if (item.Data.DataOffset+index>=item.Data.Data.length) continue;

                value=item.Data.Data[dataIndex];
                if (value==null) continue;

                if (item.DataType=="HistoryData-Vol")
                {
                    value=value.Vol;
                    valueText=this.FormatValue(value,item);
                }
                else if (item.DataType=="MultiReport")
                {
                    valueText=this.FormatMultiReport(value,item);
                }
                else
                {
                    valueText=this.FormatValue(value,item);
                }
            }

            this.Canvas.fillStyle=item.Color;

            var text=item.Name+":"+valueText;
            var textWidth=this.Canvas.measureText(text).width+2;    //后空2个像素
            this.Canvas.fillText(text,left,bottom,textWidth);
            left+=textWidth;
        }

        if (this.Explain)   //说明信息
        {
            this.Canvas.fillStyle=this.TitleColor;
            var text="说明:"+this.Explain;
            var textWidth=this.Canvas.measureText(text).width+2;
            if (left+textWidth<right)
            {
                this.Canvas.fillText(text,left,bottom,textWidth);
                left+=textWidth;
            }
        }

        if (this.ColorIndex)
        {
            this.Canvas.fillStyle='rgb(105,105,105)'
            var textWidth=this.Canvas.measureText(this.ColorIndex.Name).width+2;    //后空2个像素
            this.Canvas.fillText(this.ColorIndex.Name,left,bottom,textWidth);
            left+=textWidth;
        }

        if (this.TradeIndex)
        {
            this.Canvas.fillStyle='rgb(105,105,105)';
            var textWidth=this.Canvas.measureText(this.TradeIndex.Name).width+2;    //后空2个像素
            this.Canvas.fillText(this.TradeIndex.Name,left,bottom,textWidth);
            left+=textWidth;
        }
    }

    this.HScreenDraw=function()
    {
        var xText=this.Frame.ChartBorder.GetRightTitle();
        var yText=this.Frame.ChartBorder.GetTop();
        this.Canvas.translate(xText, yText);
        this.Canvas.rotate(90 * Math.PI / 180);

        var left=1;
        var bottom=-this.Frame.ChartBorder.TitleHeight/2;    //上下居中显示
        var right=this.Frame.ChartBorder.GetHeight();

        this.Canvas.textAlign="left";
        this.Canvas.textBaseline="middle";
        this.Canvas.font=this.Font;

        if (this.Title)
        {
            this.Canvas.fillStyle=this.TitleColor;
            var textWidth=this.Canvas.measureText(this.Title).width+2;
            this.Canvas.fillText(this.Title,left,bottom,textWidth);
            left+=textWidth;
        }

        for(var i in this.Data)
        {
            var item=this.Data[i];
            if (!item || !item.Data || !item.Data.Data || !item.Name) continue;

            if (item.Data.Data.length<=0) continue;

            var value=null;
            var valueText=null;
            if (item.DataType=="StraightLine")  //直线只有1个数据
            {
                value=item.Data.Data[0];
                valueText=this.FormatValue(value,item);
            }
            else
            {
                var index=Math.abs(this.CursorIndex-0.5);
                index=parseInt(index.toFixed(0));
                if (item.Data.DataOffset+index>=item.Data.Data.length) continue;

                value=item.Data.Data[item.Data.DataOffset+index];
                if (value==null) continue;

                if (item.DataType=="HistoryData-Vol")
                {
                    value=value.Vol;
                    valueText=this.FormatValue(value,item);
                }
                else if (item.DataType=="MultiReport")
                {
                    valueText=this.FormatMultiReport(value,item);
                }
                else
                {
                    valueText=this.FormatValue(value,item);
                }
            }

            this.Canvas.fillStyle=item.Color;

            var text=item.Name+":"+valueText;
            var textWidth=this.Canvas.measureText(text).width+2;    //后空2个像素
            this.Canvas.fillText(text,left,bottom,textWidth);
            left+=textWidth;
        }

        if (this.Explain)   //说明信息
        {
            this.Canvas.fillStyle=this.TitleColor;
            var text="说明:"+this.Explain;
            var textWidth=this.Canvas.measureText(text).width+2;
            if (left+textWidth<right)
            {
                this.Canvas.fillText(text,left,bottom,textWidth);
                left+=textWidth;
            }
        }
    }
}

//画图工具
function IChartDrawPicture()
{
    this.Frame;
    this.Canvas;
    this.Point=new Array()                      //画图的点
    this.Value=new Array();                     //XValue,YValue
    this.LinePoint=[];
    this.PointCount=2;                          //画点的个数
    this.Status=0;                              //0=开始画 1=完成第1个点  2=完成第2个点 3=完成第3个点  10=完成 20=移动
    this.PointStatus=0;                         //2=第2个点完成
    this.MovePointIndex=null;                   //移动哪个点 0-10 对应Point索引  100 整体移动
    this.ClassName='IChartDrawPicture';

    // this.LineColor=g_JSChartResource.DrawPicture.LineColor[0];                            //线段颜色
    this.LineColor="#1e90ff";      //线段颜色，input type="color" 不支持rgb和rgba 的格式
    this.AreaColor='rgba(25,25,25,0.4)';    //面积颜色
    this.PointColor=g_JSChartResource.DrawPicture.PointColor[0];

    //接口函数
    this.SetLastPoint=null; //this.SetLastPoint=function(obj)  obj={X:,Y:}
    this.Update=null;       //更新数据回调

    this.Draw=function()
    {

    }

    //Point => Value
    this.PointToValue=function()
    {
        if (!this.Frame) return false;
        var data=this.Frame.Data;
        if (!data) return false;

        for(var i in this.Point)
        {
            var item=this.Point[i];
            var xValue=parseInt(this.Frame.GetXData(item.X))+data.DataOffset;
            var yValue=this.Frame.GetYData(item.Y);

            this.Value[i]={};
            this.Value[i].XValue=xValue;
            this.Value[i].YValue=yValue;
        }

        return true;
    }

    this.IsPointIn=function(x,y)
    {
        return false;
    }

    //Value => Point
    this.ValueToPoint=function()
    {
        if (!this.Frame) return false;
        var data=this.Frame.Data;
        if (!data) return false;

        this.Point=[];
        for(var i in this.Value)
        {
            var item=this.Value[i];
            var pt=new Point();
            pt.X=this.Frame.GetXFromIndex(item.XValue-data.DataOffset);
            pt.Y=this.Frame.GetYFromData(item.YValue);
            this.Point[i]=pt;
        }
    }

    //xStep,yStep 移动的偏移量
    this.Move=function(xStep,yStep)
    {
        if (this.Status!=20) return fasle;
        if (!this.Frame) return false;
        var data=this.Frame.Data;
        if (!data) return false;
        if (this.MovePointIndex==null) return false;

        var index=parseInt(this.MovePointIndex);
        if (index===100)    //整体移动
        {
            for(var i in this.Point)
            {
                this.Point[i].X+=xStep;
                this.Point[i].Y+=yStep;
            }
        }
        else if (index===0 || index===1 || index===2 || index===3 || index===4 || index===5)
        {
            if (index<this.Point.length)
            {
                this.Point[index].X+=xStep;
                this.Point[index].Y+=yStep;
            }
        }
        else
        {
            return false;
        }
    }

    this.ClipFrame=function()
    {
        var left=this.Frame.ChartBorder.GetLeft();
        var top=this.Frame.ChartBorder.GetTopEx();
        var width=this.Frame.ChartBorder.GetWidth();
        var height=this.Frame.ChartBorder.GetHeightEx();

        this.Canvas.save();
        this.Canvas.beginPath();
        this.Canvas.rect(left,top,width,height);
        this.Canvas.clip();
    }

    //计算需要画的点的坐标option:{IsCheckX:是否检测X值, IsCheckY:是否检测Y值}
    this.CalculateDrawPoint=function(option)
    {
        if (this.Status<2) return null;
        if(!this.Point.length || !this.Frame) return null;

        var drawPoint=new Array();
        if (this.Status==10)
        {
            var data=this.Frame.Data;
            if (!data) return null;

            var showCount=this.Frame.XPointCount;
            var invaildX=0; //超出范围的x点个数
            for(var i in this.Value)
            {
                var item=this.Value[i];
                var dataIndex=item.XValue-data.DataOffset;
                if (dataIndex<0 || dataIndex>=showCount) ++invaildX;
               
                var pt=new Point();
                pt.X=this.Frame.GetXFromIndex(item.XValue-data.DataOffset,false);
                pt.Y=this.Frame.GetYFromData(item.YValue,false);
                drawPoint.push(pt);
            }

            if (option && option.IsCheckX===true)
            {
                if (invaildX==this.Value.length) return null;
            }
        }
        else
        {
            drawPoint=this.Point;
        }

        return drawPoint;
    }

    this.IsYValueInFrame=function(yValue)
    {
        if (!this.Frame) return false;

        if (yValue>this.Frame.HorizontalMax || yValue<this.Frame.HorizontalMin) return false;

        return true;
    }

    this.DrawPoint=function(aryPoint)
    {
        if (!aryPoint || aryPoint.length<=0) return;

        //画点
        this.ClipFrame();
        for(var i in aryPoint)
        {
            var item=aryPoint[i];

            this.Canvas.beginPath();
            this.Canvas.arc(item.X,item.Y,5,0,360,false);
            this.Canvas.fillStyle=this.PointColor;      //填充颜色
            this.Canvas.fill();                         //画实心圆
            this.Canvas.closePath();
        }

        this.Canvas.restore();
    }

    //计算2个点线的,左右的延长线的点
    this.CalculateExtendLinePoint=function(ptStart,ptEnd)
    {
        var result={};

        var left=this.Frame.ChartBorder.GetLeft();
        var right=this.Frame.ChartBorder.GetRight();
        var top=this.Frame.ChartBorder.GetTopEx();
        var bottom=this.Frame.ChartBorder.GetBottom();

        var a=ptEnd.X-ptStart.X;
        var b=ptEnd.Y-ptStart.Y;

        if (a>0)
        {
            var b2=bottom-ptStart.Y;
            var a2=a*b2/b;

            var pt=new Point();
            pt.X=ptStart.X+a2;
            pt.Y=bottom;
            result.End=pt;


            var b2=ptEnd.Y-top;
            var a2=a*b2/b;
            var pt2=new Point();
            pt2.Y=top;
            pt2.X=ptEnd.X-a2;
            result.Start=pt2;
        }
        else
        {
            var b2=bottom-ptStart.Y;
            var a2=Math.abs(a)*b2/b;

            var pt=new Point();
            pt.X=ptStart.X-a2;;
            pt.Y=bottom;
            result.End=pt;

            var b2=ptEnd.Y-top;
            var a2=Math.abs(a)*b2/b;
            var pt2=new Point();
            pt2.Y=top;
            pt2.X=ptEnd.X+a2;
            result.Start=pt2;
        }

        return result;
    }

    //坐标是否在点上 返回在第几个点上
    this.IsPointInXYValue=function(x,y)
    {
        if (!this.Frame) return -1;

        var data=this.Frame.Data;
        if (!data) return -1;
        if (!this.Value) return -1;

        for(var i=0;i<this.Value.length; ++i)   //是否在点上
        {
            var item=this.Value[i];
            var pt=new Point();
            pt.X=this.Frame.GetXFromIndex(item.XValue-data.DataOffset);
            pt.Y=this.Frame.GetYFromData(item.YValue);
            this.Canvas.beginPath();
            this.Canvas.arc(pt.X,pt.Y,5,0,360);
            if (this.Canvas.isPointInPath(x,y))  return i;
        }

        return -1;
    }

    //坐标是否在线段上 返回在第几个线段上
    this.IsPointInLine=function(x,y)
    {
        if (!this.LinePoint) return -1;

        for(var i in this.LinePoint)
        {
            var item=this.LinePoint[i];
            var ptStart=item.Start;
            var ptEnd=item.End;
            this.Canvas.beginPath();
            if (ptStart.X==ptEnd.X) //竖线
            {
                this.Canvas.moveTo(ptStart.X-5,ptStart.Y);
                this.Canvas.lineTo(ptStart.X+5,ptStart.Y);
                this.Canvas.lineTo(ptEnd.X+5,ptEnd.Y);
                this.Canvas.lineTo(ptEnd.X-5,ptEnd.Y);
            }
            else
            {
                this.Canvas.moveTo(ptStart.X,ptStart.Y+5);
                this.Canvas.lineTo(ptStart.X,ptStart.Y-5);
                this.Canvas.lineTo(ptEnd.X,ptEnd.Y-5);
                this.Canvas.lineTo(ptEnd.X,ptEnd.Y+5);
            }
            this.Canvas.closePath();
            if (this.Canvas.isPointInPath(x,y))
                return i;
        }

        return -1;
    }

    //0-10 鼠标对应的点索引   100=鼠标在正个图形上  -1 鼠标不在图形上
    this.IsPointIn_XYValue_Line=function(x,y)
    {
        if (this.Status!=10) return -1;

        var value=this.IsPointInXYValue(x,y);
        if (value>=0) return value;

        value=this.IsPointInLine(x,y);
        if (value>=0) return 100;

        return -1;
    }

    this.DrawLine=function(ptStart,ptEnd,isDottedline)
    {
        if (isDottedline) this.Canvas.setLineDash([5,10]);

        this.Canvas.strokeStyle=this.LineColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(ptStart.X,ptStart.Y);
        this.Canvas.lineTo(ptEnd.X,ptEnd.Y);
        this.Canvas.stroke();

        if (isDottedline) this.Canvas.setLineDash([]);
    }

    this.CreateLineData=function(ptStart,ptEnd)
    {
        var line={Start:new Point(), End:new Point()};
        line.Start.Y=ptStart.Y;
        line.Start.X=ptStart.X;
        line.End.Y=ptEnd.Y;
        line.End.X=ptEnd.X;

        return line;
    }

}

IChartDrawPicture.ColorToRGBA=function(color,opacity)
{
    return "rgba(" + parseInt("0x" + color.slice(1, 3)) + "," + parseInt("0x" + color.slice(3, 5)) + "," + parseInt("0x" + color.slice(5, 7)) + "," + opacity + ")";
}


//画图工具-线段
function ChartDrawPictureLine()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureLine';
    this.IsPointIn=this.IsPointIn_XYValue_Line;

    this.Draw=function()
    {
        this.LinePoint=[];
        var drawPoint=this.CalculateDrawPoint( {IsCheckX:true, IsCheckY:true} );
        if (!drawPoint) return;
        if (drawPoint.length!=2) return;

        this.ClipFrame();

        var ptStart=drawPoint[0];
        var ptEnd=drawPoint[1];

        this.Canvas.strokeStyle=this.LineColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(ptStart.X,ptStart.Y);
        this.Canvas.lineTo(ptEnd.X,ptEnd.Y);
        this.Canvas.stroke();

        var line={Start:ptStart, End:ptEnd};
        this.LinePoint.push(line);
        
        this.DrawPoint(drawPoint);  //画点
        this.Canvas.restore();
    }
}

//画图工具-射线
function ChartDrawPictureHaflLine()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureHaflLine';
    this.IsPointIn=this.IsPointIn_XYValue_Line;

    this.Draw=function()
    {
        this.LinePoint=[];
        var drawPoint=this.CalculateDrawPoint({IsCheckX:true, IsCheckY:true});
        if (!drawPoint || drawPoint.length!=2) return;

        var ptStart=drawPoint[0];
        var ptEnd=drawPoint[1];
        this.ClipFrame();

        this.Canvas.strokeStyle=this.LineColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(drawPoint[0].X,drawPoint[0].Y);
        this.Canvas.lineTo(drawPoint[1].X,drawPoint[1].Y);
        var endPoint=this.CalculateEndPoint(drawPoint);
        this.Canvas.lineTo(endPoint.X,endPoint.Y);
        this.Canvas.stroke();

        var line={Start:ptStart, End:ptEnd};
        this.LinePoint.push(line);

        this.DrawPoint(drawPoint);  //画点
        this.Canvas.restore();
    }

    this.CalculateEndPoint=function(aryPoint)
    {
        var left=this.Frame.ChartBorder.GetLeft();
        var right=this.Frame.ChartBorder.GetRight();

        var a=aryPoint[1].X-aryPoint[0].X;
        var b=aryPoint[1].Y-aryPoint[0].Y;

        if (a>0)
        {
            var a1=right-aryPoint[0].X;
            var b1=a1*b/a;
            var y=b1+aryPoint[0].Y;

            var pt=new Point();
            pt.X=right;
            pt.Y=y;
            return pt;
        }
        else
        {
            var a1=aryPoint[0].X-left;
            var b1=a1*b/Math.abs(a);
            var y=b1+aryPoint[0].Y;

            var pt=new Point();
            pt.X=left;
            pt.Y=y;
            return pt;
        }
    }
}

// 画图工具-水平线
function ChartDrawPictureHorizontalLine()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.PointCount=1;
    this.ClassName='ChartDrawPictureHorizontalLine';
    this.IsPointIn=this.IsPointIn_XYValue_Line;
    this.Font=16*GetDevicePixelRatio() +"px 微软雅黑";

    this.Draw=function()
    {
        this.LinePoint=[];
        var drawPoint=this.CalculateDrawPoint();
        if (!drawPoint || drawPoint.length!=1) return;
        if (!this.Frame) return;
        if (this.Value.length!=1) return;
        if (!this.IsYValueInFrame(this.Value[0].YValue)) return null;

        var left=this.Frame.ChartBorder.GetLeft();
        var right=this.Frame.ChartBorder.GetRight();
        this.ClipFrame();

        this.Canvas.strokeStyle=this.LineColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(left,drawPoint[0].Y);
        this.Canvas.lineTo(right,drawPoint[0].Y);
        this.Canvas.stroke();

        var line={Start:new Point(), End:new Point()};
        line.Start.X=left;
        line.Start.Y=drawPoint[0].Y;
        line.End.X=right;
        line.End.Y=drawPoint[0].Y;
        this.LinePoint.push(line);

        //显示价格
        var yValue=this.Frame.GetYData(drawPoint[0].Y);
        this.Canvas.fillStyle=this.LineColor;
        this.Canvas.textAlign="let";
        this.Canvas.textBaseline="bottom";
        this.Canvas.font=this.Font;
        this.Canvas.fillText(yValue.toFixed(2),left,drawPoint[0].Y);

        this.DrawPoint(drawPoint);
        this.Canvas.restore();
    }
}

//趋势线
function ChartDrawPictureTrendLine()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureTrendLine';
    this.IsPointIn=this.IsPointIn_XYValue_Line;

    this.Draw=function()
    {
        this.LinePoint=[];
        var drawPoint=this.CalculateDrawPoint({IsCheckX:true, IsCheckY:true});
        if (!drawPoint || drawPoint.length!=2) return;

        var ptStart=drawPoint[0];
        var ptEnd=drawPoint[1];
        var extendLine=this.CalculateExtendLinePoint(ptStart,ptEnd);

        this.ClipFrame();

        this.Canvas.strokeStyle=this.LineColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(extendLine.Start.X,extendLine.Start.Y);
        this.Canvas.lineTo(extendLine.End.X,extendLine.End.Y);
        this.Canvas.stroke();

        var line={Start:ptStart, End:ptEnd};
        this.LinePoint.push(line);

        this.DrawPoint(drawPoint);  //画点
        this.Canvas.restore();
    }
}


//画图工具-矩形
function ChartDrawPictureRect()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureRect';

    this.Draw=function()
    {
        var drawPoint=this.CalculateDrawPoint({IsCheckX:true, IsCheckY:true});
        if (!drawPoint || drawPoint.length!=2) return;

        this.AreaColor=IChartDrawPicture.ColorToRGBA(this.LineColor,0.3);
        this.ClipFrame();

        this.Canvas.strokeStyle=this.LineColor;
        this.Canvas.beginPath();
        this.Canvas.rect(drawPoint[0].X,drawPoint[0].Y,drawPoint[1].X-drawPoint[0].X,drawPoint[1].Y-drawPoint[0].Y);
        this.Canvas.stroke();
        
        //透明背景
        this.Canvas.fillStyle=this.AreaColor;
        this.Canvas.beginPath();
        this.Canvas.fillRect(drawPoint[0].X,drawPoint[0].Y,drawPoint[1].X-drawPoint[0].X,drawPoint[1].Y-drawPoint[0].Y);
        this.Canvas.restore();

        //画点
        this.DrawPoint(drawPoint);
    }

    //0-10 鼠标对应的点索引   100=鼠标在正个图形上  -1 鼠标不在图形上
    this.IsPointIn=function(x,y)
    {
        if (!this.Frame || this.Status!=10) return -1;

        var data=this.Frame.Data;
        if (!data) return -1;

        //是否在点上
        var aryPoint=new Array();
        for(var i in this.Value)
        {
            var item=this.Value[i];
            var pt=new Point();
            pt.X=this.Frame.GetXFromIndex(item.XValue-data.DataOffset);
            pt.Y=this.Frame.GetYFromData(item.YValue);

            this.Canvas.beginPath();
            this.Canvas.arc(pt.X,pt.Y,5,0,360);
            //console.log('['+i+']'+'x='+x+' y='+y+' dataX='+pt.X+" dataY="+pt.Y);
            if (this.Canvas.isPointInPath(x,y))
                return i;

            aryPoint.push(pt);
        }

        //是否在矩形边框上
        var linePoint=[ {X:aryPoint[0].X,Y:aryPoint[0].Y},{X:aryPoint[1].X,Y:aryPoint[0].Y}];
        if (this.IsPointInLine(linePoint,x,y))
            return 100;

        linePoint=[ {X:aryPoint[1].X,Y:aryPoint[0].Y},{X:aryPoint[1].X,Y:aryPoint[1].Y}];
        if (this.IsPointInLine2(linePoint,x,y))
            return 100;

        linePoint=[ {X:aryPoint[1].X,Y:aryPoint[1].Y},{X:aryPoint[0].X,Y:aryPoint[1].Y}];
        if (this.IsPointInLine(linePoint,x,y))
            return 100;

        linePoint=[ {X:aryPoint[0].X,Y:aryPoint[1].Y},{X:aryPoint[0].X,Y:aryPoint[0].Y}];
        if (this.IsPointInLine2(linePoint,x,y))
            return 100;

        return -1;
    }

    //点是否在线段上 水平线段
    this.IsPointInLine=function(aryPoint,x,y)
    {
        this.Canvas.beginPath();
        this.Canvas.moveTo(aryPoint[0].X,aryPoint[0].Y+5);
        this.Canvas.lineTo(aryPoint[0].X,aryPoint[0].Y-5);
        this.Canvas.lineTo(aryPoint[1].X,aryPoint[1].Y-5);
        this.Canvas.lineTo(aryPoint[1].X,aryPoint[1].Y+5);
        this.Canvas.closePath();
        if (this.Canvas.isPointInPath(x,y))
            return true;
    }

    //垂直线段
    this.IsPointInLine2=function(aryPoint,x,y)
    {
        this.Canvas.beginPath();
        this.Canvas.moveTo(aryPoint[0].X-5,aryPoint[0].Y);
        this.Canvas.lineTo(aryPoint[0].X+5,aryPoint[0].Y);
        this.Canvas.lineTo(aryPoint[1].X+5,aryPoint[1].Y);
        this.Canvas.lineTo(aryPoint[1].X-5,aryPoint[1].Y);
        this.Canvas.closePath();
        if (this.Canvas.isPointInPath(x,y))
            return true;
    }
}


//画图工具-弧形
function ChartDrawPictureArc()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureArc';

    this.Draw=function()
    {
        var drawPoint=this.CalculateDrawPoint();
        if (!drawPoint || drawPoint.length!=2) return;

        this.ClipFrame();

        //this.Canvas.beginPath();
        //this.Canvas.rect(drawPoint[0].X,drawPoint[0].Y,drawPoint[1].X-drawPoint[0].X,drawPoint[1].Y-drawPoint[0].Y);
        if (drawPoint[0].X < drawPoint[1].X && drawPoint[0].Y > drawPoint[1].Y) // 第一象限
        {
            var a = drawPoint[1].X - drawPoint[0].X;
            var b = drawPoint[0].Y - drawPoint[1].Y;
            var step = (a > b) ? 1/a : 1 / b;
            var xcenter = drawPoint[0].X;
            var ycenter = drawPoint[1].Y;
            this.Canvas.beginPath();
            this.Canvas.moveTo(drawPoint[0].X, drawPoint[0].Y);
            for (var i = 1.5*Math.PI; i < 2*Math.PI; i+=step)
            {
                this.Canvas.lineTo(xcenter+a*Math.cos(i), ycenter+b*Math.sin(i)*-1);
            }
            for (var j = 0; j <= 0.5*Math.PI; j += step)
            {
                this.Canvas.lineTo(xcenter+a*Math.cos(j), ycenter+b*Math.sin(j)*-1);
            }
        }
        else if (drawPoint[0].X > drawPoint[1].X && drawPoint[0].Y > drawPoint[1].Y) // 第二象限
        {
            var a = drawPoint[0].X - drawPoint[1].X;
            var b = drawPoint[0].Y - drawPoint[1].Y;
            var step = (a > b) ? 1/a:1/b;
            var xcenter = drawPoint[1].X;
            var ycenter = drawPoint[0].Y;
            this.Canvas.beginPath();
            this.Canvas.moveTo(drawPoint[0].X, drawPoint[0].Y);
            for (var i = 0; i <= Math.PI; i += step)
            {
                this.Canvas.lineTo(xcenter + a*Math.cos(i), ycenter + b*Math.sin(i)*-1);
            }
        }
        else if (drawPoint[0].X > drawPoint[1].X && drawPoint[0].Y < drawPoint[1].Y) // 第三象限
        {
            var a = drawPoint[0].X - drawPoint[1].X;
            var b = drawPoint[1].Y - drawPoint[0].Y;
            var step = (a > b) ? 1/a:1/b;
            var xcenter = drawPoint[0].X;
            var ycenter = drawPoint[1].Y;
            this.Canvas.beginPath();
            this.Canvas.moveTo(drawPoint[0].X, drawPoint[0].Y);
            for (var i = 0.5*Math.PI; i <= 1.5*Math.PI; i += step)
            {
                this.Canvas.lineTo(xcenter + a*Math.cos(i), ycenter + b*Math.sin(i)*-1);
            }
        }
        else if (drawPoint[0].X < drawPoint[1].X && drawPoint[0].Y < drawPoint[1].Y) // 第四象限
        {
            var a = drawPoint[1].X - drawPoint[0].X;
            var b = drawPoint[1].Y - drawPoint[0].Y;
            var step = (a > b) ? 1/a : 1/b;
            var xcenter = drawPoint[1].X;
            var ycenter = drawPoint[0].Y;
            this.Canvas.beginPath();
            this.Canvas.moveTo(drawPoint[0].X, drawPoint[0].Y);
            for (var i = Math.PI; i <= 2*Math.PI; i += step)
            {
                this.Canvas.lineTo(xcenter+a*Math.cos(i), ycenter + b*Math.sin(i)*-1);
            }
        }


        this.Canvas.strokeStyle=this.LineColor;
        this.Canvas.stroke();
        //this.Canvas.closePath();
        this.Canvas.restore();

        //画点
        this.DrawPoint(drawPoint);
    }

    //0-10 鼠标对应的点索引   100=鼠标在正个图形上  -1 鼠标不在图形上
    this.IsPointIn=function(x,y)
    {
        if (!this.Frame || this.Status!=10) return -1;

        var data=this.Frame.Data;
        if (!data) return -1;

        //是否在点上
        var aryPoint=new Array();
        for(var i in this.Value)
        {
            var item=this.Value[i];
            var pt=new Point();
            pt.X=this.Frame.GetXFromIndex(item.XValue-data.DataOffset);
            pt.Y=this.Frame.GetYFromData(item.YValue);

            this.Canvas.beginPath();
            this.Canvas.arc(pt.X,pt.Y,5,0,360);
            //console.log('['+i+']'+'x='+x+' y='+y+' dataX='+pt.X+" dataY="+pt.Y);
            if (this.Canvas.isPointInPath(x,y))
                return i;

            aryPoint.push(pt);
        }

        //是否在弧线上
        var ArcPoint=[ {X:aryPoint[0].X,Y:aryPoint[0].Y},{X:aryPoint[1].X,Y:aryPoint[1].Y}];
        if (this.IsPointInArc(ArcPoint, x, y))
            return 100;

        return -1;
    }
    this.IsPointInArc=function(aryPoint,x,y)
    {
        if (aryPoint.length != 2)
         return false;
        if (aryPoint[0].X < aryPoint[1].X && aryPoint[0].Y > aryPoint[1].Y) // 第一象限
        {
             var a = aryPoint[1].X - aryPoint[0].X;
             var b = aryPoint[0].Y - aryPoint[1].Y;
             var step = (a > b) ? 1/a : 1 / b;
             var ainer = a * 0.8;
             var biner = b * 0.8;
             var stepiner = (ainer > biner) ? 1/ainer : 1/biner;
             var xcenter = aryPoint[0].X;
             var ycenter = aryPoint[1].Y;
             this.Canvas.beginPath();
             this.Canvas.moveTo(aryPoint[0].X, aryPoint[0].Y);
             for (var i = 1.5*Math.PI; i < 2*Math.PI; i+=step)
             {
                 this.Canvas.lineTo(xcenter+a*Math.cos(i), ycenter+b*Math.sin(i)*-1);
             }
             for (var j = 0; j <= 0.5*Math.PI; j += step)
             {
                 this.Canvas.lineTo(xcenter+a*Math.cos(j), ycenter+b*Math.sin(j)*-1);
             }
             for (var k = 0.5*Math.PI; k >= 0; k -= stepiner)
             {
                 this.Canvas.lineTo(xcenter+ainer*Math.cos(k), ycenter + biner*Math.sin(j)*-1);
             }
             for (var l = 2*Math.PI; l >= 1.5*Math.PI; l -= stepiner)
             {
                 this.Canvas.lineTo(xcenter + ainer*Math.cos(l), ycenter + biner*Math.sin(l)*-1);
             }
             this.Canvas.closePath();
        }
         else if (aryPoint[0].X > aryPoint[1].X && aryPoint[0].Y > aryPoint[1].Y) // 第二象限
         {
             var a = aryPoint[0].X - aryPoint[1].X;
             var b = aryPoint[0].Y - aryPoint[1].Y;
             var step = (a > b) ? 1/a:1/b;
             var ainer = a * 0.8;
             var biner = b * 0.8;
             var stepiner = (ainer > biner) ? 1 / ainer : 1 / biner;
             var xcenter = aryPoint[1].X;
             var ycenter = aryPoint[0].Y;
             this.Canvas.beginPath();
             this.Canvas.moveTo(aryPoint[0].X, aryPoint[0].Y);
             for (var i = 0; i <= Math.PI; i += step)
             {
                 this.Canvas.lineTo(xcenter + a*Math.cos(i), ycenter + b*Math.sin(i)*-1);
             }
             for (var j = Math.PI; j >= 0; j -= stepiner)
             {
                 this.Canvas.lineTo(xcenter + ainer * Math.cos(j), ycenter + biner*Math.sin(j)*-1);
             }
             this.Canvas.closePath();
         }
         else if (aryPoint[0].X > aryPoint[1].X && aryPoint[0].Y < aryPoint[1].Y) // 第三象限
         {
             var a = aryPoint[0].X - aryPoint[1].X;
             var b = aryPoint[1].Y - aryPoint[0].Y;
             var step = (a > b) ? 1/a:1/b;
             var ainer = a * 0.8;
             var biner = b * 0.8;
             var stepiner = (ainer > biner) ? 1/ainer : 1/biner;
             var xcenter = aryPoint[0].X;
             var ycenter = aryPoint[1].Y;
             this.Canvas.beginPath();
             this.Canvas.moveTo(aryPoint[0].X, aryPoint[0].Y);
             for (var i = 0.5*Math.PI; i <= 1.5*Math.PI; i += step)
             {
                 this.Canvas.lineTo(xcenter + a*Math.cos(i), ycenter + b*Math.sin(i)*-1);
             }
             for (var j = 1.5*Math.PI; j >= 0.5*Math.PI; j -= stepiner)
             {
                 this.Canvas.lineTo(xcenter + ainer * Math.cos(j), ycenter + biner*Math.sin(j)*-1);
             }
             this.Canvas.closePath();
         }
         else if (aryPoint[0].X < aryPoint[1].X && aryPoint[0].Y < aryPoint[1].Y) // 第四象限
         {
             var a = aryPoint[1].X - aryPoint[0].X;
             var b = aryPoint[1].Y - aryPoint[0].Y;
             var step = (a > b) ? 1/a : 1/b;
             var ainer = a * 0.8;
             var biner = b * 0.8;
             var stepiner = (ainer > biner) ? 1/ainer : 1/biner;
             var xcenter = aryPoint[1].X;
             var ycenter = aryPoint[0].Y;
             this.Canvas.beginPath();
             this.Canvas.moveTo(aryPoint[0].X, aryPoint[0].Y);
             for (var i = Math.PI; i <= 2*Math.PI; i += step)
             {
                 this.Canvas.lineTo(xcenter+a*Math.cos(i), ycenter + b*Math.sin(i)*-1);
             }
             for (var j = 2*Math.PI; j >= Math.PI; j -= stepiner)
             {
                 this.Canvas.lineTo(xcenter + ainer*Math.cos(j), ycenter + biner*Math.sin(j)*-1);
             }
             this.Canvas.closePath();
         }
         if (this.Canvas.isPointInPath(x,y))
            return true;
         else
            return false;

    }

}

//M头W底
function ChartDrawPictureWaveMW()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureWaveMW';
    this.PointCount=2;
    this.IsPointIn=this.IsPointIn_XYValue_Line;

    this.Draw=function()
    {
        this.LinePoint=[];
        var drawPoint=this.CalculateDrawPoint({IsCheckX:true, IsCheckY:true});
        if (!drawPoint) return;
        
        //var points=drawPoint.slice(0);
        this.AreaColor=IChartDrawPicture.ColorToRGBA(this.LineColor,0.3);
        this.ClipFrame();
        
        this.CalculateLines(drawPoint);
        for(var i in this.LinePoint)
        {
            var item=this.LinePoint[i];
            this.DrawLine(item.Start,item.End);
        }
       
        this.DrawPoint(drawPoint); //画点
        this.Canvas.restore();
    }

    this.CalculateLines=function(points)
    {
        if (!this.Frame) return;
        if (points.length<2) return;

        if (this.Status==2)
        {
            var line={Start:new Point(), End:new Point()};
            line.Start.Y=points[0].Y;
            line.Start.X=points[0].X;
            line.End.Y=points[1].Y;
            line.End.X=points[1].X;
            this.LinePoint.push(line);
    
            var xMove=points[1].X-points[0].X;
            line={Start:new Point(), End:new Point()};
            line.Start.Y=points[1].Y;
            line.Start.X=points[1].X;
            line.End.Y=points[0].Y;
            line.End.X=points[1].X+xMove;
            this.LinePoint.push(line);

            var ptStart=line.End;
            var newPt=new Point();
            newPt.X=ptStart.X;
            newPt.Y=ptStart.Y;
            this.Point[2]=newPt;
            line={Start:new Point(), End:new Point()};
            line.Start.Y=ptStart.Y;
            line.Start.X=ptStart.X;
            line.End.Y=points[1].Y;
            line.End.X=ptStart.X+xMove;
            this.LinePoint.push(line);

            var ptStart=line.End;
            var newPt=new Point();
            newPt.X=ptStart.X;
            newPt.Y=ptStart.Y;
            this.Point[3]=newPt;
            line={Start:new Point(), End:new Point()};
            line.Start.Y=ptStart.Y;
            line.Start.X=ptStart.X;
            line.End.Y=points[0].Y;
            line.End.X=ptStart.X+xMove;
            this.LinePoint.push(line);

            var ptStart=line.End;
            var newPt=new Point();
            newPt.X=ptStart.X;
            newPt.Y=ptStart.Y;
            this.Point[4]=newPt;

            this.PointCount=this.Point.length;
        }
        else if (points.length==5)
        {
            var line={Start:new Point(), End:new Point()};
            line.Start.Y=points[0].Y;
            line.Start.X=points[0].X;
            line.End.Y=points[1].Y;
            line.End.X=points[1].X;
            this.LinePoint.push(line);
    
            var line={Start:new Point(), End:new Point()};
            line.Start.Y=points[1].Y;
            line.Start.X=points[1].X;
            line.End.Y=points[2].Y;
            line.End.X=points[2].X;
            this.LinePoint.push(line);

            var line={Start:new Point(), End:new Point()};
            line.Start.Y=points[2].Y;
            line.Start.X=points[2].X;
            line.End.Y=points[3].Y;
            line.End.X=points[3].X;
            this.LinePoint.push(line);

            var line={Start:new Point(), End:new Point()};
            line.Start.Y=points[3].Y;
            line.Start.X=points[3].X;
            line.End.Y=points[4].Y;
            line.End.X=points[4].X;
            this.LinePoint.push(line);
        }
    }
}

//平行线
function ChartDrawPictureParallelLines()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureParallelLines';
    this.IsPointIn=this.IsPointIn_XYValue_Line;
    this.PointCount=3;
    this.LastPoint;

    this.Draw=function()
    {
        this.LinePoint=[];
        var drawPoint=this.CalculateDrawPoint({IsCheckX:true, IsCheckY:true});
        if (!drawPoint) return;

        this.AreaColor=IChartDrawPicture.ColorToRGBA(this.LineColor,0.3);
        var points=drawPoint.slice(0);
        this.CalculateLines(points);

        this.ClipFrame();

        for(var i in this.LinePoint)
        {
            var item=this.LinePoint[i];
            this.DrawLine(item.Start,item.End);
        }

        this.DrawArea();
        this.DrawPoint(points);  //画点
        this.Canvas.restore(); 
    }

    this.SetLastPoint=function(obj)
    {
        this.LastPoint={X:obj.X,Y:obj.Y};
    }

    this.DrawArea=function()
    {
        if (this.LinePoint.length!=2) return;

        this.Canvas.fillStyle=this.AreaColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(this.LinePoint[0].Start.X,this.LinePoint[0].Start.Y);
        this.Canvas.lineTo(this.LinePoint[0].End.X,this.LinePoint[0].End.Y);
        this.Canvas.lineTo(this.LinePoint[1].End.X,this.LinePoint[1].End.Y);
        this.Canvas.lineTo(this.LinePoint[1].Start.X,this.LinePoint[1].Start.Y);
        this.Canvas.closePath();
        this.Canvas.fill();
    }

    this.CalculateLines=function(points)
    {
        if (this.PointStatus==2 && this.LastPoint)
        {
            var pt=new Point();
            pt.X=this.LastPoint.X;
            pt.Y=this.LastPoint.Y;
            points[2]=pt;
        }

        if (points.length==2)
        {
            var linePoint=this.CalculateExtendLinePoint(points[0],points[1]);
            this.LinePoint.push(linePoint);
        }
        else if (points.length==3)
        {
            var linePoint=this.CalculateExtendLinePoint(points[0],points[1]);
            this.LinePoint.push(linePoint);

            //计算平行线
            var xMove=points[2].X-points[1].X;
            var yMove=points[2].Y-points[1].Y;

            var ptStart=new Point();
            var ptEnd=new Point();
            ptStart.X=points[0].X+xMove;
            ptStart.Y=points[0].Y+yMove;
            ptEnd.X=points[1].X+xMove;
            ptEnd.Y=points[1].Y+yMove;
            linePoint=this.CalculateExtendLinePoint(ptStart,ptEnd);
            this.LinePoint.push(linePoint);
        }
    }
}

//价格通道线
function ChartDrawPicturePriceChannel()
{
    this.newMethod=ChartDrawPictureParallelLines;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPicturePriceChannel';

    this.CalculateLines=function(points)
    {
        if (this.PointStatus==2 && this.LastPoint)
        {
            var pt=new Point();
            pt.X=this.LastPoint.X;
            pt.Y=this.LastPoint.Y;
            points[2]=pt;
        }

        if (points.length==2)
        {
            var linePoint=this.CalculateExtendLinePoint(points[0],points[1]);
            this.LinePoint.push(linePoint);
        }
        else if (points.length==3)
        {
            var linePoint=this.CalculateExtendLinePoint(points[0],points[1]);
            this.LinePoint.push(linePoint);

            //计算平行线
            var xMove=points[2].X-points[1].X;
            var yMove=points[2].Y-points[1].Y;

            var ptStart=new Point();
            var ptEnd=new Point();
            ptStart.X=points[0].X+xMove;
            ptStart.Y=points[0].Y+yMove;
            ptEnd.X=points[1].X+xMove;
            ptEnd.Y=points[1].Y+yMove;
            linePoint=this.CalculateExtendLinePoint(ptStart,ptEnd);
            this.LinePoint.push(linePoint);

            var ptStart=new Point();
            var ptEnd=new Point();
            ptStart.X=points[0].X-xMove;
            ptStart.Y=points[0].Y-yMove;
            ptEnd.X=points[1].X-xMove;
            ptEnd.Y=points[1].Y-yMove;
            linePoint=this.CalculateExtendLinePoint(ptStart,ptEnd);
            this.LinePoint.push(linePoint);
        }
    }

    this.DrawArea=function()
    {
        if (this.LinePoint.length!=3) return;

        this.Canvas.fillStyle=this.AreaColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(this.LinePoint[1].Start.X,this.LinePoint[1].Start.Y);
        this.Canvas.lineTo(this.LinePoint[1].End.X,this.LinePoint[1].End.Y);
        this.Canvas.lineTo(this.LinePoint[2].End.X,this.LinePoint[2].End.Y);
        this.Canvas.lineTo(this.LinePoint[2].Start.X,this.LinePoint[2].Start.Y);
        this.Canvas.closePath();
        this.Canvas.fill();
    }
}

//平行通道
function ChartDrawPictureParallelChannel()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureParallelChannel';
    this.ChannelWidth=50;
    this.AreaColor='rgba(25,25,25,0.4)';
    this.LinePoint=[];

    //计算需要画的点的坐标
    this.CalculateDrawPoint=function()
    {
        if (this.Status<2) return null;
        if(!this.Point.length || !this.Frame) return null;
        var data=this.Frame.Data;
        if (!data) return null;

        var drawPoint=[];
        if (this.Status==10)    //完成
        {
            for(var i=0; i<2; ++i)
            {
                var item=this.Value[i];
                var pt=new Point();
                pt.X=this.Frame.GetXFromIndex(item.XValue-data.DataOffset);
                pt.Y=this.Frame.GetYFromData(item.YValue);
                drawPoint.push(pt);
            }
        }
        else
        {
            for(var i=0; i<this.Point.length; ++i)
            {
                var item=this.Point[i];
                var pt=new Point();
                pt.X=item.X;
                pt.Y=item.Y;
                drawPoint.push(pt);
            }
        }

        if (drawPoint.length>=2)
        {
            var linePoint={Start:new Point(), End:new Point() };
            linePoint.Start.X=drawPoint[0].X;
            linePoint.Start.Y=drawPoint[0].Y;
            linePoint.End.X=drawPoint[1].X;
            linePoint.End.Y=drawPoint[1].Y;
            this.LinePoint.push(linePoint);

            if (drawPoint.length==3 || this.Status==10)
            {
                var x=linePoint.End.X-linePoint.Start.X;
                var y=linePoint.End.Y-linePoint.Start.Y;
                var angle=Math.atan(Math.abs(x/y));
                var yMove=this.ChannelWidth/Math.sin(angle);

                //console.log('[ChartDrawPictureParallelChannel::CalculateDrawPoint]',xMove);
                
                linePoint={Start:new Point(), End:new Point() };
                linePoint.Start.X=drawPoint[0].X;
                linePoint.Start.Y=drawPoint[0].Y-yMove;
                linePoint.End.X=drawPoint[1].X;
                linePoint.End.Y=drawPoint[1].Y-yMove;
                this.LinePoint.push(linePoint);

                var ptCenter=new Point();
                ptCenter.X=linePoint.Start.X+(linePoint.End.X-linePoint.Start.X)/2;
                ptCenter.Y=linePoint.Start.Y+(linePoint.End.Y-linePoint.Start.Y)/2;
                drawPoint[3]=ptCenter;

                this.Point[2]=ptCenter;
                var xValue=parseInt(this.Frame.GetXData(ptCenter.X))+data.DataOffset;
                var yValue=this.Frame.GetYData(ptCenter.Y);
                this.Value[2]={XValue:xValue,YValue:yValue};
                this.PointCount=this.Point.length;  //完成以后是3个点
            }
        }
    
        return drawPoint;
    }

    this.DrawLine=function(ptStart,ptEnd)
    {
        this.Canvas.strokeStyle=this.LineColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(ptStart.X,ptStart.Y);
        this.Canvas.lineTo(ptEnd.X,ptEnd.Y);
        this.Canvas.stroke();
    }

    this.DrawArea=function(pt,pt2,pt3,pt4)
    {
        this.Canvas.fillStyle=this.AreaColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(pt.X,pt.Y);
        this.Canvas.lineTo(pt2.X,pt2.Y);
        this.Canvas.lineTo(pt3.X,pt3.Y);
        this.Canvas.lineTo(pt4.X,pt4.Y);
        this.Canvas.closePath();
        this.Canvas.fill();
    }

    this.Draw=function()
    {
        this.LinePoint=[];
        var drawPoint=this.CalculateDrawPoint();
        if (!drawPoint) return;

        this.AreaColor=IChartDrawPicture.ColorToRGBA(this.LineColor,0.3);
        this.ClipFrame();

        for(var i in this.LinePoint)
        {
            var item=this.LinePoint[i];
            this.DrawLine(item.Start,item.End);
        }

        if (this.LinePoint.length==2)
        {
            this.DrawArea(this.LinePoint[0].Start,this.LinePoint[0].End,this.LinePoint[1].End,this.LinePoint[1].Start);
        }

        this.Canvas.restore();
       
        this.DrawPoint(drawPoint); //画点
    }

    //xStep,yStep 移动的偏移量
    this.Move=function(xStep,yStep)
    {
        if (this.Status!=20) return fasle;
        if (!this.Frame) return false;
        var data=this.Frame.Data;
        if (!data) return false;

        if (this.MovePointIndex==100)    //整体移动
        {
            for(var i in this.Point)
            {
                this.Point[i].X+=xStep;
                this.Point[i].Y+=yStep;
            }
        }
        else if (this.MovePointIndex==0 || this.MovePointIndex==1)
        {
            if (this.MovePointIndex<this.Point.length)
            {
                this.Point[this.MovePointIndex].X+=xStep;
                this.Point[this.MovePointIndex].Y+=yStep;
            }
        }
        else if (this.MovePointIndex==2)    //宽度的点要计算
        {
            this.Point[this.MovePointIndex].X+=xStep;
            this.Point[this.MovePointIndex].Y+=yStep;

            var x=this.Point[1].X-this.Point[0].X;
            var y=this.Point[1].Y-this.Point[0].Y;
            var angle=Math.atan(Math.abs(x/y));
            var yMove=this.ChannelWidth/Math.sin(angle)-yStep;
            this.ChannelWidth=Math.sin(angle)*yMove;
        }
    }

    //0-10 鼠标对应的点索引   100=鼠标在正个图形上  -1 鼠标不在图形上
    this.IsPointIn=function(x,y)
    {
        if (!this.Frame || this.Status!=10) return -1;

        var data=this.Frame.Data;
        if (!data) return -1;

        //是否在点上
        for(var i=0;i<this.Value.length; ++i)
        {
            var item=this.Value[i];
            var pt=new Point();
            if (i<2)
            {
                pt.X=this.Frame.GetXFromIndex(item.XValue-data.DataOffset);
                pt.Y=this.Frame.GetYFromData(item.YValue);
            }
            else    //第3个点使用实际坐标
            {
                if (i>=this.Point.length) continue;
                pt.X=this.Point[i].X;
                pt.Y=this.Point[i].Y;
            }

            this.Canvas.beginPath();
            this.Canvas.arc(pt.X,pt.Y,5,0,360);
            if (this.Canvas.isPointInPath(x,y))  return i;
        }

        //是否在线段上
        for(var i in this.LinePoint)
        {
            var item=this.LinePoint[i];
            var ptStart=item.Start;
            var ptEnd=item.End;
            this.Canvas.beginPath();
            this.Canvas.moveTo(ptStart.X,ptStart.Y+5);
            this.Canvas.lineTo(ptStart.X,ptStart.Y-5);
            this.Canvas.lineTo(ptEnd.X,ptEnd.Y-5);
            this.Canvas.lineTo(ptEnd.X,ptEnd.Y+5);
            this.Canvas.closePath();
            if (this.Canvas.isPointInPath(x,y))
                return 100;
        }

        return -1;
    }
}

//文本
function ChartDrawPictureText()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureText';
    this.Text='文本';
    this.PointCount=1;
    this.FontOption={ Family:'微软雅黑', Size:20, Weight:null, Style:null };    //Weight(bold 粗体), Style(italic)
    //矢量图片
    //this.Text="\ue606";
    //this.FontOption={ Family:'iconfont', Size:20, Weight:null, Style:null };    //Weight(bold 粗体), Style(italic)
    this.TextRect=null;   //文字区域
    this.IsInitialized=false;   //是否初始化了
    this.SettingMenu;

    this.Draw=function(textFont)
    {
        this.TextRect=null;
        var drawPoint=this.CalculateDrawPoint({IsCheckX:true, IsCheckY:true});
        if (!drawPoint || drawPoint.length!=1) return;

        this.ClipFrame();

        this.Canvas.fillStyle=this.LineColor;
        this.Canvas.textAlign="center";
        this.Canvas.textBaseline="bottom";
        this.Canvas.font=this.GetTextFont();
        this.Canvas.fillText(this.Text,drawPoint[0].X,drawPoint[0].Y);
        var textWidth=this.Canvas.measureText(this.Text).width;

        this.TextRect={};
        this.TextRect.Left=drawPoint[0].X-textWidth/2;
        this.TextRect.Top=drawPoint[0].Y-this.FontOption.Size;
        this.TextRect.Width=textWidth;
        this.TextRect.Height=this.FontOption.Size;
        //this.Canvas.strokeRect(this.TextRect.Left,this.TextRect.Top,this.TextRect.Width,this.TextRect.Height);
        this.Canvas.restore();

        if (this.IsInitialized===false) 
        {
            this.SetTextOption();
            this.IsInitialized=true;
        }
    }

    //根据设置动态生成字体
    this.GetTextFont=function()
    {
        const defaultFont=16*GetDevicePixelRatio() +"px 微软雅黑";
        if (!this.FontOption || !this.FontOption.Family || this.FontOption.Size<=0) return defaultFont;

        var font='';
        if (this.FontOption.Color) font+=this.FontOption.Color+' ';
        if (this.FontOption.Style) font+=this.FontOption.Style+' ';
        if (this.FontOption.Weight) font+=this.FontOption.Weight+' ';
        if (this.FontOption.Size>=0) font+=this.FontOption.Size*GetDevicePixelRatio()+'px ';
        font+=this.FontOption.Family;

        return font;
    }

    this.SetTextOption=function()
    {
        console.log('[ChartDrawPictureText::SetTextOption]');
        //创建div设置窗口
        if (!this.SettingMenu) this.SettingMenu=new ChartPictureTextSettingMenu(this.Frame.ChartBorder.UIElement.parentNode);

        this.SettingMenu.ChartPicture=this;
        this.SettingMenu.Position={Left:this.TextRect.Left+this.TextRect.Width,Top:this.TextRect.Top};
        this.SettingMenu.DoModal();
    }

    this.IsPointIn=function(x,y)
    {
        if (!this.Frame || this.Status!=10) return -1;

        var data=this.Frame.Data;
        if (!data) return -1;
        if (!this.TextRect) return -1;

        this.Canvas.beginPath();
        this.Canvas.rect(this.TextRect.Left,this.TextRect.Top,this.TextRect.Width,this.TextRect.Height);
        if (this.Canvas.isPointInPath(x,y)) return 100;

        return -1;
    }
}

//iconfont 图片
function ChartDrawPictureIconFont()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureIconFont';
    this.PointCount=1;
    //矢量图片
    this.Text="\ue606";
    this.FontOption={ Family:'iconfont', Size:24};    //Weight(bold 粗体), Style(italic)
    this.TextRect=null;         //文字区域
    this.SettingMenu;

    this.Draw=function()
    {
        this.TextRect=null;
        var drawPoint=this.CalculateDrawPoint({IsCheckX:true, IsCheckY:true});
        if (!drawPoint || drawPoint.length!=1) return;
        var font=this.GetTextFont();
        if (!font) return;

        this.ClipFrame();

        this.Canvas.fillStyle=this.LineColor;
        this.Canvas.textAlign="center";
        this.Canvas.textBaseline="bottom";
        this.Canvas.font=font;
        this.Canvas.fillText(this.Text,drawPoint[0].X,drawPoint[0].Y);
        var textWidth=this.Canvas.measureText(this.Text).width;

        this.TextRect={};
        this.TextRect.Left=drawPoint[0].X-textWidth/2;
        this.TextRect.Top=drawPoint[0].Y-this.FontOption.Size;
        this.TextRect.Width=textWidth;
        this.TextRect.Height=this.FontOption.Size;
        //this.Canvas.strokeRect(this.TextRect.Left,this.TextRect.Top,this.TextRect.Width,this.TextRect.Height);
        this.Canvas.restore();
    }

    //根据设置动态生成字体
    this.GetTextFont=function()
    {
        if (!this.FontOption || !this.FontOption.Family || this.FontOption.Size<=0) return null;

        var font='';
        if (this.FontOption.Size>=0) font+=this.FontOption.Size*GetDevicePixelRatio()+'px ';
        font+=this.FontOption.Family;

        return font;
    }

    this.IsPointIn=function(x,y)
    {
        if (!this.Frame || this.Status!=10) return -1;

        var data=this.Frame.Data;
        if (!data) return -1;
        if (!this.TextRect) return -1;

        this.Canvas.beginPath();
        this.Canvas.rect(this.TextRect.Left,this.TextRect.Top,this.TextRect.Width,this.TextRect.Height);
        if (this.Canvas.isPointInPath(x,y)) return 100;

        return -1;
    }
}

//江恩角度线（Gann Fan），亦又称作甘氏线的
function ChartDrawPictureGannFan()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureGannFan';
    this.IsPointIn=this.IsPointIn_XYValue_Line;
    this.LinePoint=[];
    this.Font=16*GetDevicePixelRatio() +"px 微软雅黑";


    this.Draw=function()
    {
        this.LinePoint=[];
        var drawPoint=this.CalculateDrawPoint({IsCheckX:true, IsCheckY:true});
        if (!drawPoint) return;
        if (drawPoint.length!=2) return;

        this.AreaColor=IChartDrawPicture.ColorToRGBA(this.LineColor,0.3);
        this.ClipFrame();
        var quadrant=this.GetQuadrant(drawPoint[0],drawPoint[1]);

        if (quadrant===1 || quadrant===4)
        {
            this.CalculateLines(drawPoint[0],drawPoint[1],quadrant);
            this.DrawArea();

            for(var i in this.LinePoint)
            {
                var item=this.LinePoint[i];
                this.DrawLine(item.Start,item.End,item.IsDottedLine);
            }

            for(var i in this.LinePoint)
            {
                var item =this.LinePoint[i];
                if (item.Text && item.PtEnd) this.DrawTitle(item.PtEnd,item.Text);
            }
        }
        else
        {
            this.DrawLine(drawPoint[0],drawPoint[1],false);
        }

        this.Canvas.restore();
        this.DrawPoint(drawPoint); //画点
    }

    //获取在第几象限
    this.GetQuadrant=function(ptStart,ptEnd)
    {
        if (ptStart.X<ptEnd.X && ptStart.Y>ptEnd.Y) return 1;
        else if (ptStart.X<ptEnd.X && ptStart.Y>ptEnd.Y) return 2;
        else if (ptStart.X < ptEnd.X && ptStart.Y< ptEnd.Y) return 4;
        else return 3;
    }

    //isDotline 是否是虚线
    this.DrawLine=function(ptStart,ptEnd,isDottedline)
    {
        if (isDottedline) this.Canvas.setLineDash([5,10]);

        this.Canvas.strokeStyle=this.LineColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(ptStart.X,ptStart.Y);
        this.Canvas.lineTo(ptEnd.X,ptEnd.Y);
        this.Canvas.stroke();

        if (isDottedline) this.Canvas.setLineDash([]);
    }

    this.DrawTitle=function(pt,text)
    {
        this.Canvas.fillStyle=this.LineColor;
        this.Canvas.textAlign="left";
        this.Canvas.textBaseline="bottom";
        this.Canvas.font=this.Font;
        this.Canvas.fillText(text,pt.X,pt.Y);
    }

    this.DrawArea=function()
    {
        var lineStart=null,lineEnd=null;
        for(var i in this.LinePoint)
        {
            var item=this.LinePoint[i];
            if (item.Text=='1:8') lineStart=this.LinePoint[i];
            else if (item.Text=='8:1') lineEnd=this.LinePoint[i];
        }

        if (!lineStart || !lineEnd) return;

        this.Canvas.fillStyle=this.AreaColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(lineStart.End.X,lineStart.End.Y);
        this.Canvas.lineTo(lineStart.Start.X,lineStart.Start.Y);
        this.Canvas.lineTo(lineEnd.End.X,lineEnd.End.Y);
        this.Canvas.closePath();
        this.Canvas.fill();
    }

    //计算线段
    this.CalculateLines=function(ptStart,ptEnd,quadrant)
    {
        if (!this.Frame) return false;
        var top=this.Frame.ChartBorder.GetTopEx();
        var right=this.Frame.ChartBorder.GetRight();
        var bottom=this.Frame.ChartBorder.GetBottom();

        const SPLIT_LINE_VALUE=[0.5, 1.0/3, 0.25, 0.125, 2.0/3]; 
        const SPLIT_LINE_X_TITLE=["1:2","1:3","1:4","1:8","2:3"];
	    const SPLIT_LINE_Y_TITLE=["2:1","3:1","4:1","8:1","3:2"];
        var ptLineStart=new Point();
        var ptLineEnd=new Point();
        ptLineStart.X=ptStart.X;
        ptLineStart.Y=ptStart.Y;
        ptLineEnd.X=ptEnd.X;
        ptLineEnd.Y=ptEnd.Y;
        var lineWidth=Math.abs(ptStart.X-ptEnd.X);
        var lineHeight=Math.abs(ptStart.Y-ptEnd.Y);
        if (quadrant===1)
        {
            /*
            var line={Start:ptLineStart, End:new Point(), IsDottedLine:false};
            line.End.X=ptStart.X;
            line.End.Y=top;
            this.LinePoint.push(line);

            line={Start:ptLineStart, End:new Point(), IsDottedLine:false};
            line.End.X=right;
            line.End.Y=ptStart.Y;
            this.LinePoint.push(line);
            */

            var extendLine=this.CalculateExtendLinePoint(ptStart,ptEnd);
            var line={Start:ptLineStart, End:extendLine.Start, IsDottedLine:false,PtEnd:ptLineEnd, Text:'1:1'};
            this.LinePoint.push(line);

            for(var i in SPLIT_LINE_VALUE)
            {
                if (lineWidth>5)
                {
                    line={Start:ptLineStart, End:null, IsDottedLine:false,PtEnd:new Point(),Text:SPLIT_LINE_X_TITLE[i]};
                    line.PtEnd.Y=ptEnd.Y;
                    line.PtEnd.X=ptStart.X+lineWidth*SPLIT_LINE_VALUE[i];
                    var extendLine=this.CalculateExtendLinePoint(line.Start,line.PtEnd);
                    line.End=extendLine.Start;
                    this.LinePoint.push(line);
                }
                if (lineHeight>5)
                {
                    line={Start:ptLineStart, End:null, IsDottedLine:false,PtEnd:new Point(), Text:SPLIT_LINE_Y_TITLE[i]};
                    line.PtEnd.Y=ptStart.Y-lineHeight*SPLIT_LINE_VALUE[i];
                    line.PtEnd.X=ptEnd.X;
                    var extendLine=this.CalculateExtendLinePoint(line.Start,line.PtEnd);
                    line.End=extendLine.Start;
                    this.LinePoint.push(line);
                }
            }
            
        }
        else if (quadrant==4)
        {
            /*
            var line={Start:ptLineStart, End:new Point(), IsDottedLine:false};
            line.End.X=ptStart.X;
            line.End.Y=bottom;
            this.LinePoint.push(line);

            line={Start:ptLineStart, End:new Point(), IsDottedLine:false};
            line.End.X=right;
            line.End.Y=ptStart.Y;
            this.LinePoint.push(line);
            */

            var extendLine=this.CalculateExtendLinePoint(ptStart,ptEnd);
            var line={Start:ptLineStart, End:extendLine.End, IsDottedLine:false,PtEnd:ptLineEnd, Text:'1:1'};
            this.LinePoint.push(line);

            for(var i in SPLIT_LINE_VALUE)
            {
                if (lineWidth>5)
                {
                    line={Start:ptLineStart, End:null, IsDottedLine:false,PtEnd:new Point(),Text:SPLIT_LINE_X_TITLE[i]};
                    line.PtEnd.Y=ptEnd.Y;
                    line.PtEnd.X=ptStart.X+lineWidth*SPLIT_LINE_VALUE[i];
                    var extendLine=this.CalculateExtendLinePoint(line.Start,line.PtEnd);
                    line.End=extendLine.End;
                    this.LinePoint.push(line);
                }
                if (lineHeight>5)
                {
                    line={Start:ptLineStart, End:null, IsDottedLine:false,PtEnd:new Point(), Text:SPLIT_LINE_Y_TITLE[i]};
                    line.PtEnd.Y=ptStart.Y+lineHeight*SPLIT_LINE_VALUE[i];
                    line.PtEnd.X=ptEnd.X;
                    var extendLine=this.CalculateExtendLinePoint(line.Start,line.PtEnd);
                    line.End=extendLine.End;
                    this.LinePoint.push(line);
                }
            }
        }
        else return false;

        return true;
    }
}

//阻速线  （高 3等份）
function ChartDrawPictureResistanceLine()
{
    this.newMethod=ChartDrawPictureGannFan;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureResistanceLine';

    //计算线段
    this.CalculateLines=function(ptStart,ptEnd,quadrant)
    {
        if (!this.Frame) return false;
        var top=this.Frame.ChartBorder.GetTopEx();
        var right=this.Frame.ChartBorder.GetRight();
        var bottom=this.Frame.ChartBorder.GetBottom();

        const SPLIT_LINE_VALUE=[1.0/3, 2.0/3]; 
	    const SPLIT_LINE_Y_TITLE=["3:1","3:2"];
        var ptLineStart=new Point();
        var ptLineEnd=new Point();
        ptLineStart.X=ptStart.X;
        ptLineStart.Y=ptStart.Y;
        ptLineEnd.X=ptEnd.X;
        ptLineEnd.Y=ptEnd.Y;
        var lineWidth=Math.abs(ptStart.X-ptEnd.X);
        var lineHeight=Math.abs(ptStart.Y-ptEnd.Y);
        if (quadrant===1)
        {
            var extendLine=this.CalculateExtendLinePoint(ptStart,ptEnd);
            var line={Start:ptLineStart, End:extendLine.Start, IsDottedLine:false,PtEnd:ptLineEnd, Text:'1:1'};
            this.LinePoint.push(line);

            for(var i in SPLIT_LINE_VALUE)
            {
                if (lineHeight>5)
                {
                    line={Start:ptLineStart, End:null, IsDottedLine:false,PtEnd:new Point(), Text:SPLIT_LINE_Y_TITLE[i]};
                    line.PtEnd.Y=ptStart.Y-lineHeight*SPLIT_LINE_VALUE[i];
                    line.PtEnd.X=ptEnd.X;
                    var extendLine=this.CalculateExtendLinePoint(line.Start,line.PtEnd);
                    line.End=extendLine.Start;
                    this.LinePoint.push(line);
                }
            }
            
        }
        else if (quadrant==4)
        {
            var extendLine=this.CalculateExtendLinePoint(ptStart,ptEnd);
            var line={Start:ptLineStart, End:extendLine.End, IsDottedLine:false,PtEnd:ptLineEnd, Text:'1:1'};
            this.LinePoint.push(line);

            for(var i in SPLIT_LINE_VALUE)
            {
                if (lineHeight>5)
                {
                    line={Start:ptLineStart, End:null, IsDottedLine:false,PtEnd:new Point(), Text:SPLIT_LINE_Y_TITLE[i]};
                    line.PtEnd.Y=ptStart.Y+lineHeight*SPLIT_LINE_VALUE[i];
                    line.PtEnd.X=ptEnd.X;
                    var extendLine=this.CalculateExtendLinePoint(line.Start,line.PtEnd);
                    line.End=extendLine.End;
                    this.LinePoint.push(line);
                }
            }
        }
        else return false;

        return true;
    }

    this.DrawArea=function()
    {
        var lineStart=null,lineEnd=null;
        for(var i in this.LinePoint)
        {
            var item=this.LinePoint[i];
            if (item.Text=='1:1') lineStart=this.LinePoint[i];
            else if (item.Text=='3:1') lineEnd=this.LinePoint[i];
        }

        if (!lineStart || !lineEnd) return;

        this.Canvas.fillStyle=this.AreaColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(lineStart.End.X,lineStart.End.Y);
        this.Canvas.lineTo(lineStart.Start.X,lineStart.Start.Y);
        this.Canvas.lineTo(lineEnd.End.X,lineEnd.End.Y);
        this.Canvas.closePath();
        this.Canvas.fill();
    }
}

//黄金分割线
function ChartDrawPictureGoldenSection()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureGoldenSectionLine';
    this.IsPointIn=this.IsPointIn_XYValue_Line;
    this.Font=14*GetDevicePixelRatio() +"px 微软雅黑";
    
    this.GetSectionData=function()
    {
        const GOLDEN_SECTION_DATA= [0,0.236,0.382,0.5,0.618,0.80,1,1.236,1.382,1.5,1.618,1.8,2];
        return GOLDEN_SECTION_DATA;
    }

    this.Draw=function()
    {
        this.LinePoint=[];
        var drawPoint=this.CalculateDrawPoint();
        if (!drawPoint) return;
        if (drawPoint.length!=2) return;

        this.AreaColor=IChartDrawPicture.ColorToRGBA(this.LineColor,0.3);
        
        this.CalculateLines(drawPoint[0],drawPoint[1]);
        this.ClipFrame();
        
        for(var i in this.LinePoint)
        {
            var item=this.LinePoint[i];
            this.DrawLine(item.Start,item.End,item.IsDottedLine);
        }

        for(var i in this.LinePoint)
        {
            var item =this.LinePoint[i];
            if (item.Text) this.DrawTitle(item.Start,item.Text);
        }

        this.DrawPoint(drawPoint); //画点
        this.Canvas.restore();
        
    }

    this.CalculateLines=function(ptStart,ptEnd)
    {
        var sectionData=this.GetSectionData();
        var left=this.Frame.ChartBorder.GetLeft();
        var right=this.Frame.ChartBorder.GetRight();
        var lineHeight=ptStart.Y-ptEnd.Y;
        for(var i=0;i<sectionData.length;++i)
        {
            var yMove=lineHeight*sectionData[i];

            var line={Start:new Point(), End:new Point(),};
            line.Start.Y=ptStart.Y-yMove;
            line.Start.X=left;
            line.End.Y=ptStart.Y-yMove;
            line.End.X=right;

            var text='';
            if (i==0) text='Base '
            else text=(sectionData[i]*100).toFixed(2)+'% ';

            var yValue=this.Frame.GetYData(line.Start.Y);
            text+=yValue.toFixed(2);

            line.Text=text;
           
            this.LinePoint.push(line);
        }
    }

    this.DrawLine=function(ptStart,ptEnd)
    {
        this.Canvas.strokeStyle=this.LineColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(ptStart.X,ptStart.Y);
        this.Canvas.lineTo(ptEnd.X,ptEnd.Y);
        this.Canvas.stroke();
    }

    this.DrawTitle=function(pt,text)
    {
        this.Canvas.fillStyle=this.LineColor;
        this.Canvas.textAlign="left";
        this.Canvas.textBaseline="bottom";
        this.Canvas.font=this.Font;
        this.Canvas.fillText(text,pt.X,pt.Y);
    }
}

//百分比线
function ChartDrawPicturePercentage()
{
    this.newMethod=ChartDrawPictureGoldenSection;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPicturePercentage';

    this.GetSectionData=function()
    {
        const GOLDEN_SECTION_DATA= [0, 0.25, 0.333, 0.50, 1];
        return GOLDEN_SECTION_DATA;
    }

}

//波段线
function ChartDrawPictureWaveBand()
{
    this.newMethod=ChartDrawPictureGoldenSection;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureWaveBand';

    this.GetSectionData=function()
    {
        const GOLDEN_SECTION_DATA= [0,0.125, 0.25, 0.375, 0.50, 0.625, 0.75, 0.875,1];
        return GOLDEN_SECTION_DATA;
    }
}

//三角形
function ChartDrawPictureTriangle()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureTriangle';
    this.PointCount=3;
    this.Font=16*GetDevicePixelRatio() +"px 微软雅黑";
    this.IsPointIn=this.IsPointIn_XYValue_Line;
    this.LastPoint;

    this.Draw=function()
    {
        this.LinePoint=[];
        var drawPoint=this.CalculateDrawPoint({IsCheckX:true, IsCheckY:true});
        if (!drawPoint) return;
        
        var points=drawPoint.slice(0);
        this.AreaColor=IChartDrawPicture.ColorToRGBA(this.LineColor,0.3);
        this.ClipFrame();
        
        this.CalculateLines(points);
        for(var i in this.LinePoint)
        {
            var item=this.LinePoint[i];
            this.DrawLine(item.Start,item.End);
        }

        this.DrawArea(points);
        this.DrawPoint(points); //画点
        this.DrawTitle(points);

        this.Canvas.restore();
        
    }

    this.DrawArea=function(points)
    {
        if (points.length!=3) return;

        this.Canvas.fillStyle=this.AreaColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(points[0].X,points[0].Y);
        this.Canvas.lineTo(points[1].X,points[1].Y);
        this.Canvas.lineTo(points[2].X,points[2].Y);
        this.Canvas.lineTo(points[0].X,points[0].Y);
        this.Canvas.closePath();
        this.Canvas.fill();
    }

    //显示角度数据
    this.DrawTitle=function(points)
    {
        if (this.Status!=10) return;   //拖拽完成以后才显示角度数据

        //输出3个点的角度
        /*
        this.Canvas.fillStyle=this.LineColor;
        this.Canvas.textAlign="left";
        this.Canvas.textBaseline="bottom";
        this.Canvas.font=this.Font;
        this.Canvas.fillText('∠60',points[0].X,points[0].Y);
        */
    }

    this.SetLastPoint=function(obj)
    {
        this.LastPoint={X:obj.X,Y:obj.Y};
    }

    this.CalculateLines=function(points)
    {
        if (this.PointStatus==2 && this.LastPoint)
        {
            var pt=new Point();
            pt.X=this.LastPoint.X;
            pt.Y=this.LastPoint.Y;
            points[2]=pt;
        }

        if (points.length===2)
        {
            var line={Start:new Point(), End:new Point()};
            line.Start.Y=points[0].Y;
            line.Start.X=points[0].X;
            line.End.Y=points[1].Y;
            line.End.X=points[1].X;
            this.LinePoint.push(line);
        }
        else if (points.length===3)
        {
            var line={Start:new Point(), End:new Point()};
            line.Start.Y=points[0].Y;
            line.Start.X=points[0].X;
            line.End.Y=points[1].Y;
            line.End.X=points[1].X;
            this.LinePoint.push(line);

            line={Start:new Point(), End:new Point()};
            line.Start.Y=points[1].Y;
            line.Start.X=points[1].X;
            line.End.Y=points[2].Y;
            line.End.X=points[2].X;
            this.LinePoint.push(line);

            line={Start:new Point(), End:new Point()};
            line.Start.Y=points[2].Y;
            line.Start.X=points[2].X;
            line.End.Y=points[0].Y;
            line.End.X=points[0].X;
            this.LinePoint.push(line);
        }
    }
}

//对称角度
function ChartDrawPictureSymmetryAngle()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureSymmetryAngle';
    this.PointCount=2;
    this.Font=16*GetDevicePixelRatio() +"px 微软雅黑";
    this.IsPointIn=this.IsPointIn_XYValue_Line;

    this.Draw=function()
    {
        this.LinePoint=[];
        var drawPoint=this.CalculateDrawPoint({IsCheckX:true, IsCheckY:true});
        if (!drawPoint) return;
        
        //var points=drawPoint.slice(0);
        this.AreaColor=IChartDrawPicture.ColorToRGBA(this.LineColor,0.3);
        this.ClipFrame();
        
        this.CalculateLines(drawPoint);
        for(var i in this.LinePoint)
        {
            var item=this.LinePoint[i];
            this.DrawLine(item.Start,item.End);
        }
        this.DrawArea();
        this.DrawPoint(drawPoint); //画点
        this.DrawTitle(drawPoint);
        this.Canvas.restore();
    }

    this.CalculateLines=function(points)
    {
        if (points.length!=2) return;
        if (!this.Frame) return;

        var line={Start:new Point(), End:new Point()};
        line.Start.Y=points[0].Y;
        line.Start.X=points[0].X;
        line.End.Y=points[1].Y;
        line.End.X=points[1].X;
        this.LinePoint.push(line);

        line={Start:new Point(), End:new Point()};
        line.Start.Y=points[0].Y;
        line.Start.X=points[0].X;
        line.End.Y=points[1].Y;
        line.End.X=points[0].X;
        this.LinePoint.push(line);

        var xMove=points[0].X-points[1].X;
        line={Start:new Point(), End:new Point()};
        line.Start.Y=points[0].Y;
        line.Start.X=points[0].X;
        line.End.Y=points[1].Y;
        line.End.X=points[0].X+xMove;
        this.LinePoint.push(line);
    }

    this.DrawArea=function()
    {
        if (this.LinePoint.length!=3) return;

        this.Canvas.fillStyle=this.AreaColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(this.LinePoint[0].Start.X,this.LinePoint[0].Start.Y);
        this.Canvas.lineTo(this.LinePoint[0].End.X,this.LinePoint[0].End.Y);
        this.Canvas.lineTo(this.LinePoint[2].End.X,this.LinePoint[2].End.Y);
        this.Canvas.moveTo(this.LinePoint[0].Start.X,this.LinePoint[0].Start.Y);
        this.Canvas.closePath();
        this.Canvas.fill();
    }

    //显示角度数据
    this.DrawTitle=function(points)
    {
        if (this.Status!=10) return;   //拖拽完成以后才显示角度数据

        //输出点的角度
        /*
        this.Canvas.fillStyle=this.LineColor;
        this.Canvas.textAlign="left";
        this.Canvas.textBaseline="bottom";
        this.Canvas.font=this.Font;
        this.Canvas.fillText('∠60',points[0].X,points[0].Y);
        */
    }
}

//圆
function ChartDrawPictureCircle()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureCircle';
    this.PointCount=2;
    this.CircleData;

    this.Draw=function()
    {
        this.LinePoint=[];
        var drawPoint=this.CalculateDrawPoint({IsCheckX:true, IsCheckY:true});
        if (!drawPoint || drawPoint.length!=2) return;
        
        this.AreaColor=IChartDrawPicture.ColorToRGBA(this.LineColor,0.3);
        this.ClipFrame();

        var x=drawPoint[0].X-drawPoint[1].X;
        var y=drawPoint[0].Y-drawPoint[1].Y;
        var r=Math.sqrt(x*x+y*y);
        
        this.Canvas.fillStyle=this.AreaColor;
        this.Canvas.strokeStyle=this.LineColor;
        this.DrawLine(drawPoint[0],drawPoint[1]);
        this.Canvas.beginPath();
        this.Canvas.arc(drawPoint[0].X,drawPoint[0].Y,r,0,2*Math.PI);
        this.Canvas.stroke();
        this.Canvas.fill();
        this.CircleData={X:drawPoint[0].X, Y:drawPoint[0].Y, R:r};

        this.DrawPoint(drawPoint); //画点
        this.Canvas.restore();
    }

    //0-10 鼠标对应的点索引   100=鼠标在正个图形上  -1 鼠标不在图形上
    this.IsPointIn=function(x,y)
    {
        if (this.Status!=10) return -1;

        var value=this.IsPointInXYValue(x,y);
        if (value>=0) return value;

        if (this.CircleData && this.CircleData.R>8)
        {
            var triangleX=this.CircleData.X-x;
            var triangleY=this.CircleData.Y-y;
            var r=Math.sqrt(triangleX*triangleX+triangleY*triangleY);   //计算直径
            if (r<this.CircleData.R && r>this.CircleData.R-8) return 100;
        }

        return -1;
    }
}

//四边形
function ChartDrawPictureQuadrangle()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureQuadrangle';
    this.IsPointIn=this.IsPointIn_XYValue_Line;
    this.PointCount=3;
    this.LastPoint;

    this.Draw=function()
    {
        this.LinePoint=[];
        var drawPoint=this.CalculateDrawPoint({IsCheckX:true, IsCheckY:true});
        if (!drawPoint) return;

        this.AreaColor=IChartDrawPicture.ColorToRGBA(this.LineColor,0.3);
        var points=drawPoint.slice(0);
        this.CalculateLines(points);

        this.ClipFrame();

        for(var i in this.LinePoint)
        {
            var item=this.LinePoint[i];
            this.DrawLine(item.Start,item.End);
        }

        this.DrawArea();
        this.DrawPoint(points);  //画点
        this.Canvas.restore(); 
    }

    this.SetLastPoint=function(obj)
    {
        this.LastPoint={X:obj.X,Y:obj.Y};
    }

    this.DrawArea=function()
    {
        if (this.LinePoint.length!=4) return;

        this.Canvas.fillStyle=this.AreaColor;
        this.Canvas.beginPath();
        this.Canvas.moveTo(this.LinePoint[0].Start.X,this.LinePoint[0].Start.Y);
        this.Canvas.lineTo(this.LinePoint[0].End.X,this.LinePoint[0].End.Y);
        this.Canvas.lineTo(this.LinePoint[1].End.X,this.LinePoint[1].End.Y);
        this.Canvas.lineTo(this.LinePoint[2].End.X,this.LinePoint[2].End.Y);
        this.Canvas.closePath();
        this.Canvas.fill();
    }

    this.CalculateLines=function(points)
    {
        if (this.PointStatus==2 && this.LastPoint)
        {
            var pt=new Point();
            pt.X=this.LastPoint.X;
            pt.Y=this.LastPoint.Y;
            points[2]=pt;
        }

        if (points.length==2)
        {
            var linePoint=this.CreateLineData(points[0],points[1]);
            this.LinePoint.push(linePoint);
        }
        else if (points.length==3)
        {
            var linePoint=this.CreateLineData(points[0],points[1]);
            this.LinePoint.push(linePoint);

            var linePoint=this.CreateLineData(points[1],points[2]);
            this.LinePoint.push(linePoint);

            //计算平行线
            var xMove=points[2].X-points[1].X;
            var yMove=points[2].Y-points[1].Y;

            var pt4=new Point();    //第4个点的坐标
            pt4.X=points[0].X+xMove;
            pt4.Y=points[0].Y+yMove;
            
            var linePoint=this.CreateLineData(points[2],pt4);
            this.LinePoint.push(linePoint);

            var linePoint=this.CreateLineData(pt4,points[0]);
            this.LinePoint.push(linePoint);
        }
    }
}

//斐波那契周期线
function ChartDrawPictureFibonacci()
{
    this.newMethod=IChartDrawPicture;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ChartDrawPictureFibonacci';
    this.PointCount=1;
    this.Font=14*GetDevicePixelRatio() +"px 微软雅黑";
    this.IsPointIn=this.IsPointIn_XYValue_Line;

    this.Draw=function()
    {
        this.LinePoint=[];
        var drawPoint=this.CalculateDrawPoint();
        if (!drawPoint) return;

        this.CalculateLines();
        if (this.LinePoint.length<=0) return;

        this.ClipFrame();

        for(var i in this.LinePoint)
        {
            var item=this.LinePoint[i];
            this.DrawLine(item.Start,item.End);
            this.DrawTitle(item.Start,item.Title);
        }

        this.DrawPoint(drawPoint);  //画点
        this.Canvas.restore(); 
    }

    this.DrawTitle=function(pt,text)
    {
        this.Canvas.fillStyle=this.LineColor;
        this.Canvas.textAlign="left";
        this.Canvas.textBaseline="top";
        this.Canvas.font=this.Font;
        this.Canvas.fillText(text,pt.X+2,pt.Y+10);
    }

    this.CalculateLines=function()
    {
        if (this.Status<2) return;
        if (!this.Frame) return;
        var data=this.Frame.Data;
        if (!data) return;

        var xStart=null;
        if (this.Status==10)
        {
            if (this.Value.length!=1) return;
            xStart=this.Value[0].XValue;
        }
        else
        {
            if (this.Point.length!=1) return;
            xStart=parseInt(this.Frame.GetXData(this.Point[0].X))+data.DataOffset;
        }
        
        var top=this.Frame.ChartBorder.GetTopEx();
        var bottom=this.Frame.ChartBorder.GetBottom();
        var showCount=this.Frame.XPointCount;
        const LINE_DATA=[1,2,3,5,8,13,21,34,55,89,144,233];
        for(var i=0;i<LINE_DATA.length;++i)
        {
            var xValue=xStart+LINE_DATA[i];
            var dataIndex=xValue-data.DataOffset;
            if (dataIndex<0 || dataIndex>=showCount) continue;

            var x=this.Frame.GetXFromIndex(xValue-data.DataOffset,false);

            var line={Start:new Point(), End:new Point(), Title:LINE_DATA[i]};
            line.Start.Y=top;
            line.Start.X=x;
            line.End.Y=bottom;
            line.End.X=x;
            this.LinePoint.push(line);
        }

    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//  数据分割
//  [0]=Start起始 [1]=End结束 [2]=FixInterval修正的间隔 [3]=Increase
//
function SplitData()
{
    this.Data=[
        [0.000001,	0.000002,	0.000001,	0.0000001],
        [0.000002,	0.000004,	0.000002,	0.0000002],
        [0.000004,	0.000005,	0.000004,	0.0000001],
        [0.000005,	0.00001,	0.000005,	0.0000005],

        [0.00001,	0.00002,	0.00001,	0.000001],
        [0.00002,	0.00004,	0.00002,	0.000002],
        [0.00004,	0.00005,	0.00004,	0.000001],
        [0.00005,	0.0001,		0.00005,	0.000005],

        [0.0001,		0.0002,		0.0001,	0.00001],
        [0.0002,		0.0004,		0.0002,	0.00002],
        [0.0004,		0.0005,		0.0004,	0.00001],
        [0.0005,		0.001,		0.0005,	0.00005],

        [0.001,		0.002,		0.001,	0.0001],
        [0.002,		0.004,		0.002,	0.0002],
        [0.004,		0.005,		0.004,	0.0001],
        [0.005,		0.01,		0.005,	0.0005],

        [0.01,		0.02,		0.01,	0.001],
        [0.02,		0.04,		0.02,	0.002],
        [0.04,		0.05,		0.04,	0.001],
        [0.05,		0.1,		0.05,	0.005],

        [0.1,		0.2,		0.1,	0.01],
        [0.2,		0.4,		0.2,	0.02],
        [0.4,		0.5,		0.4,	0.01],
        [0.5,		1,			0.5,	0.05],

        [1,		2,		1,	0.05],
        [2,		4,		2,	0.05],
        [4,		5,		4,	0.05],
        [5,		10,		5,	0.05],

        [10,		12,		10,	2],
        [20,		40,		20,	5],
        [40,		50,		40,	2],
        [50,		100,	50,	10],

        [100,		200,		100,	10],
        [200,		400,		200,	20],
        [400,		500,		400,	10],
        [500,		1000,		500,	50],

        [1000,		2000,		1000,	50],
        [2000,		4000,		2000,	50],
        [4000,		5000,		4000,	50],
        [5000,		10000,		5000,	100],

        [10000,		20000,		10000,	1000],
        [20000,		40000,		20000,	2000],
        [40000,		50000,		40000,	1000],
        [50000,		100000,		50000,	5000],

        [100000,		200000,		100000,	10000],
        [200000,		400000,		200000,	20000],
        [400000,		500000,		400000,	10000],
        [500000,		1000000,	500000,	50000],

        [1000000,		2000000,		1000000,	100000],
        [2000000,		4000000,		2000000,	200000],
        [4000000,		5000000,		4000000,	100000],
        [5000000,		10000000,		5000000,	500000],

        [10000000,		20000000,		10000000,	1000000],
        [20000000,		40000000,		20000000,	2000000],
        [40000000,		50000000,		40000000,	1000000],
        [50000000,		100000000,		50000000,	5000000],

        [100000000,		200000000,		100000000,	10000000],
        [200000000,		400000000,		100000000,	10000000],
        [400000000,		500000000,		100000000,	10000000],
        [500000000,		1000000000,		100000000,	10000000],

        [1000000000,		2000000000,		1000000000,	100000000],
        [2000000000,		4000000000,		2000000000,	200000000],
        [4000000000,		5000000000,		4000000000,	100000000],
        [5000000000,		10000000000,	5000000000,	500000000]
    ];

    this.Find=function(interval)
    {
        for(var i in this.Data)
        {
            var item =this.Data[i];
            if (interval>item[0] && interval<=item[1])
            {
                var result={};
                result.FixInterval=item[2];
                result.Increase=item[3];
                return result;
            }
        }

        return null;
    }
}

function PriceSplitData()
{
    this.newMethod=SplitData;   //派生
    this.newMethod();
    delete this.newMethod;

    this.Data=[
        [0.000001,	0.000002,	0.000001,	0.0000001],
        [0.000002,	0.000004,	0.000002,	0.0000002],
        [0.000004,	0.000005,	0.000004,	0.0000001],
        [0.000005,	0.00001,	0.000005,	0.0000005],

        [0.00001,	0.00002,	0.00001,	0.000001],
        [0.00002,	0.00004,	0.00002,	0.000002],
        [0.00004,	0.00005,	0.00004,	0.000001],
        [0.00005,	0.0001,		0.00005,	0.000005],

        [0.0001,		0.0002,		0.0001,	0.00001],
        [0.0002,		0.0004,		0.0002,	0.00002],
        [0.0004,		0.0005,		0.0004,	0.00001],
        [0.0005,		0.001,		0.0005,	0.00005],

        [0.001,		0.002,		0.001,	0.0001],
        [0.002,		0.004,		0.002,	0.0002],
        [0.004,		0.005,		0.004,	0.0001],
        [0.005,		0.01,		0.005,	0.0005],

        [0.01,		0.02,		0.01,	0.001],
        [0.02,		0.04,		0.02,	0.002],
        [0.04,		0.05,		0.04,	0.001],
        [0.05,		0.1,		0.05,	0.005],

        [0.1,		0.2,		0.1,	0.01],
        [0.2,		0.4,		0.2,	0.02],
        [0.4,		0.5,		0.2,	0.01],
        [0.5,		0.8,		0.2,	0.05],
        [0.8,		1,			0.5,	0.05],

        [1,		2,		0.5,	0.05],
        [2,		4,		0.5,	0.05],
        [4,		5,		0.5,	0.05],
        [5,		10,		0.5,	0.05],

        [10,		12,		10,	2],
        [20,		40,		20,	5],
        [40,		50,		40,	2],
        [50,		100,	50,	10],

        [100,		200,		100,	10],
        [200,		400,		200,	20],
        [400,		500,		400,	10],
        [500,		1000,		500,	50],

        [1000,		2000,		1000,	50],
        [2000,		4000,		2000,	50],
        [4000,		5000,		4000,	50],
        [5000,		10000,		5000,	100],

        [10000,		20000,		10000,	1000],
        [20000,		40000,		20000,	2000],
        [40000,		50000,		40000,	1000],
        [50000,		100000,		50000,	5000],

        [100000,		200000,		100000,	10000],
        [200000,		400000,		200000,	20000],
        [400000,		500000,		400000,	10000],
        [500000,		1000000,	500000,	50000],

        [1000000,		2000000,		1000000,	100000],
        [2000000,		4000000,		2000000,	200000],
        [4000000,		5000000,		4000000,	100000],
        [5000000,		10000000,		5000000,	500000],

        [10000000,		20000000,		10000000,	1000000],
        [20000000,		40000000,		20000000,	2000000],
        [40000000,		50000000,		40000000,	1000000],
        [50000000,		100000000,		50000000,	5000000],

        [100000000,		200000000,		100000000,	10000000],
        [200000000,		400000000,		200000000,	20000000],
        [400000000,		500000000,		400000000,	10000000],
        [500000000,		1000000000,		500000000,	50000000],

        [1000000000,		2000000000,		1000000000,	100000000],
        [2000000000,		4000000000,		2000000000,	200000000],
        [4000000000,		5000000000,		4000000000,	100000000],
        [5000000000,		10000000000,	5000000000,	500000000]
    ];
}

/////////////////////////////////////////////////////////////////////////////
//   全局配置颜色
//
//
function JSChartResource()
{
    this.TooltipBGColor="rgb(255, 255, 255)"; //背景色
    this.TooltipAlpha=0.92;                  //透明度

    this.SelectRectBGColor="rgba(1,130,212,0.06)"; //背景色
 //   this.SelectRectAlpha=0.06;                  //透明度

    this.UpBarColor="rgb(238,21,21)";
    this.DownBarColor="rgb(25,158,0)";
    this.UnchagneBarColor="rgb(0,0,0)";

    this.Minute={};
    this.Minute.VolBarColor="rgb(238,127,9)";
    this.Minute.PriceColor="rgb(50,171,205)";
    this.Minute.AreaPriceColor='rgba(50,171,205,0.1)';
    this.Minute.AvPriceColor="rgb(238,127,9)";

    this.DefaultTextColor="rgb(43,54,69)";
    this.DefaultTextFont=14*GetDevicePixelRatio() +'px 微软雅黑';
    this.TitleFont=13*GetDevicePixelRatio() +'px 微软雅黑';

    this.UpTextColor="rgb(238,21,21)";
    this.DownTextColor="rgb(25,158,0)";
    this.UnchagneTextColor="rgb(0,0,0)";
    this.CloseLineColor='rgb(178,34,34)';

    this.FrameBorderPen="rgb(225,236,242)";
    this.FrameSplitPen="rgb(225,236,242)";      //分割线
    this.FrameSplitTextColor="rgb(117,125,129)";   //刻度文字颜色
    this.FrameSplitTextFont=14*GetDevicePixelRatio() +"px 微软雅黑";     //坐标刻度文字字体
    this.FrameTitleBGColor="rgb(246,251,253)";  //标题栏背景色

    this.CorssCursorBGColor="rgb(43,54,69)";            //十字光标背景
    this.CorssCursorTextColor="rgb(255,255,255)";
    this.CorssCursorTextFont=14*GetDevicePixelRatio() +"px 微软雅黑";
    this.CorssCursorPenColor="rgb(130,130,130)";           //十字光标线段颜色

    this.LockBGColor = "rgb(220, 220, 220)";
    this.LockTextColor = "rgb(210, 34, 34)";

    this.Domain="https://opensource.zealink.com";               //API域名
    this.CacheDomain="https://opensourcecache.zealink.com";     //缓存域名
    this.PyIndexDomain='https://py.zealink.com';                //py指标计算域名

    this.KLine={
            MaxMin: {Font:12*GetDevicePixelRatio() +'px 微软雅黑',Color:'rgb(43,54,69)'},   //K线最大最小值显示
            Info:  //信息地雷
            {
                Investor:
                {
                    ApiUrl:'https://opensource.zealink.com/API/NewsInteract', //互动易
                    IconFont: { Family:'iconfont', Text:'\ue631' , HScreenText:'\ue684', Color:'#1c65db'} //SVG 文本
                },
                Announcement:                                           //公告
                {
                    ApiUrl:'https://opensource.zealink.com/API/ReportList',
                    IconFont: { Family:'iconfont', Text:'\ue633', HScreenText:'\ue685', Color:'#f5a521' }, //SVG 文本
                    IconFont2: { Family:'iconfont', Text:'\ue634', HScreenText:'\ue686', Color:'#ed7520' } //SVG 文本 //季报
                },
                Pforecast:  //业绩预告
                {
                    ApiUrl:'https://opensource.zealink.com/API/StockHistoryDay',
                    IconFont: { Family:'iconfont', Text:'\ue62e', HScreenText:'\ue687', Color:'#986cad' } //SVG 文本
                },
                Research:   //调研
                {
                    ApiUrl:'https://opensource.zealink.com/API/InvestorRelationsList',
                    IconFont: { Family:'iconfont', Text:'\ue632', HScreenText:'\ue688', Color:'#19b1b7' } //SVG 文本
                },
                BlockTrading:   //大宗交易
                {
                    ApiUrl:'https://opensource.zealink.com/API/StockHistoryDay',
                    IconFont: { Family:'iconfont', Text:'\ue630', HScreenText:'\ue689', Color:'#f39f7c' } //SVG 文本
                },
                TradeDetail:    //龙虎榜
                {
                    ApiUrl:'https://opensource.zealink.com/API/StockHistoryDay',
                    IconFont: { Family:'iconfont', Text:'\ue62f', HScreenText:'\ue68a' ,Color:'#b22626' } //SVG 文本
                }

            },
            NumIcon:
            {
                Color:'rgb(251,80,80)',Family:'iconfont',
                Text:[  '\ue649',
                        '\ue63b','\ue640','\ue63d','\ue63f','\ue645','\ue641','\ue647','\ue648','\ue646','\ue636',
                        '\ue635','\ue637','\ue638','\ue639','\ue63a','\ue63c','\ue63e','\ue642','\ue644','\ue643'
                    ]
            },
            TradeIcon:  //交易指标 图标
            {
                Family:'iconfont', 
                Buy: { Color:'rgb(255,15,4)', Text:'\ue683', HScreenText:'\ue682'}, 
                Sell: { Color:'rgb(64,122,22)', Text:'\ue681',HScreenText:'\ue680'},
            }
        };

    this.Index={};
    //指标线段颜色
    this.Index.LineColor=
    [
        "rgb(255,174,0)",
        "rgb(25,199,255)",
        "rgb(175,95,162)",
        "rgb(236,105,65)",
        "rgb(68,114,196)",
        "rgb(229,0,79)",
        "rgb(0,128,255)",
        "rgb(252,96,154)",
        "rgb(42,230,215)",
        "rgb(24,71,178)",

    ];

    //历史数据api
    this.Index.StockHistoryDayApiUrl="https://opensource.zealink.com/API/StockHistoryDay";
    //市场多空
    this.Index.MarketLongShortApiUrl="https://opensource.zealink.com/API/FactorTiming";
    //市场关注度
    this.Index.MarketAttentionApiUrl="https://opensource.zealink.com/API/MarketAttention";
    //行业,指数热度
    this.Index.MarketHeatApiUrl="https://opensource.zealink.com/API/MarketHeat";
    //自定义指数热度
    this.Index.CustomIndexHeatApiUrl="https://opensource.zealink.com/API/QuadrantCalculate";

    //指标不支持信息
    this.Index.NotSupport={Font:"14px 微软雅黑", TextColor:"rgb(52,52,52)"};

    //画图工具
    this.DrawPicture={};
    this.DrawPicture.LineColor=
    [
        "rgb(30,144,255)",
    ];

    this.DrawPicture.PointColor=
    [
        "rgb(105,105,105)",
    ];

    this.KLineTrain = {
        Font:'bold 14px arial',
        LastDataIcon: {Color:'rgb(0,0,205)',Text:'⬇'},
        BuyIcon: {Color:'rgb(0,205,102 )',Text:'B'},
        SellIcon: {Color:'rgb(255,127,36 )',Text:'S'},

        IconFont:
        {
            Family:'iconfont', 
            Buy:{ Text:'\ue64a', HScreenText:'\ue68a' ,Color:'rgb(255,140,0)' },
            Sell:{ Text:'\ue64b', HScreenText:'\ue68a' ,Color:'rgb(6,79,18)' },
            Last:{ Text:'\ue681', HScreenText:'\ue68a' ,Color:'rgb(55,0,255)' },
        }
    };

    //自定义风格
    this.SetStyle=function(style)
    {
        if (style.TooltipBGColor) this.TooltipBGColor = style.TooltipBGColor;
        if (style.TooltipAlpha) this.TooltipAlpha = style.TooltipAlpha;
        if (style.SelectRectBGColor) this.SelectRectBGColor = style.SelectRectBGColor;
        if (style.UpBarColor) this.UpBarColor = style.UpBarColor;
        if (style.DownBarColor) this.DownBarColor = style.DownBarColor;
        if (style.UnchagneBarColor) this.UnchagneBarColor = style.UnchagneBarColor;
        if (style.Minute) 
        {
            if (style.Minute.VolBarColor) this.Minute.VolBarColor = style.Minute.VolBarColor;
            if (style.Minute.PriceColor) this.Minute.PriceColor = style.Minute.PriceColor;
            if (style.Minute.AvPriceColor) this.Minute.AvPriceColor = style.Minute.AvPriceColor;
        }

        if (style.DefaultTextColor) this.DefaultTextColor = style.DefaultTextColor;
        if (style.DefaultTextFont) this.DefaultTextFont = style.DefaultTextFont;
        if (style.TitleFont) this.TitleFont = style.TitleFont;
        if (style.UpTextColor) this.UpTextColor = style.UpTextColor;
        if (style.DownTextColor) this.DownTextColor = style.DownTextColor;
        if (style.UnchagneTextColor) this.UnchagneTextColor = style.UnchagneTextColor;
        if (style.CloseLineColor) this.CloseLineColor = style.CloseLineColor;
        if (style.FrameBorderPen) this.FrameBorderPen = style.FrameBorderPen;
        if (style.FrameSplitPen) this.FrameSplitPen = style.FrameSplitPen;
        if (style.FrameSplitTextColor) this.FrameSplitTextColor = style.FrameSplitTextColor;
        if (style.FrameSplitTextFont) this.FrameSplitTextFont = style.FrameSplitTextFont;
        if (style.FrameTitleBGColor) this.FrameTitleBGColor = style.FrameTitleBGColor;
        if (style.CorssCursorBGColor) this.CorssCursorBGColor = style.CorssCursorBGColor;
        if (style.CorssCursorTextColor) this.CorssCursorTextColor = style.CorssCursorTextColor;
        if (style.CorssCursorTextFont) this.CorssCursorTextFont = style.CorssCursorTextFont;
        if (style.CorssCursorPenColor) this.CorssCursorPenColor = style.CorssCursorPenColor;
        if (style.KLine) this.KLine = style.KLine;

        if (style.Index) 
        {
            if (style.Index.LineColor) this.Index.LineColor = style.Index.LineColor;
            if (style.Index.NotSupport) this.Index.NotSupport = style.Index.NotSupport;
        }
        
        if (style.ColorArray) this.ColorArray = style.ColorArray;

        if (style.DrawPicture)
        {
            this.DrawPicture.LineColor = style.DrawPicture.LineColor;
            this.DrawPicture.PointColor = style.DrawPicture.PointColor;
        }
    }
}

var g_JSChartResource=new JSChartResource();



/*
    指标列表 指标信息都在这里,不够后面再加字段
*/
function JSIndexMap()
{

}

JSIndexMap.Get=function(id)
{
    var indexMap=new Map(
    [
        //公司自己的指标
        ["市场多空",    {IsMainIndex:false,  Create:function(){ return new MarketLongShortIndex()}  }],
        ["市场择时",    {IsMainIndex:false,  Create:function(){ return new MarketTimingIndex()}  }],
        ["市场关注度",  {IsMainIndex:false,  Create:function(){ return new MarketAttentionIndex()}  }],
        ["指数热度",    {IsMainIndex:false,  Create:function(){ return new MarketHeatIndex()}  }],
        ["财务粉饰",    {IsMainIndex:false,  Create:function(){ return new BenfordIndex()}  }],

        ["自定义指数热度", {IsMainIndex:false,  Create:function(){ return new CustonIndexHeatIndex()} , Name:'自定义指数热度'} ],

        //能图指标
        ["能图-趋势",       {IsMainIndex:false,  Create:function(){ return new LighterIndex1()},   Name:'大盘/个股趋势'  }],
        ["能图-位置研判",   {IsMainIndex:false,  Create:function(){ return new LighterIndex2()},   Name:'位置研判'  }],
        ["能图-点位研判",   {IsMainIndex:false,  Create:function(){ return new LighterIndex3()},   Name:'点位研判'  }]
    ]
    );

    return indexMap.get(id);
}

////////////////////////////////////////////////////////////////////////////////////////////////
//      指标计算方法
//
//
//

function HQIndexFormula()
{

}

//指数平均数指标 EMA(close,10)
HQIndexFormula.EMA=function(data,dayCount)
{
    var result = [];

    var offset=0;
    if (offset>=data.length) return result;

    //取首个有效数据
    for(;offset<data.length;++offset)
    {
        if (data[offset]!=null && !isNaN(data[offset]))
            break;
    }

    var p1Index=offset;
    var p2Index=offset+1;

    result[p1Index]=data[p1Index];
    for(var i=offset+1;i<data.length;++i,++p1Index,++p2Index)
    {
        result[p2Index]=((2*data[p2Index]+(dayCount-1)*result[p1Index]))/(dayCount+1);
    }

    return result;
}

HQIndexFormula.SMA=function(data,n,m)
{
    var result = [];

    var i=0;
    var lastData=null;
    for(;i<data.length; ++i)
    {
        if (data[i]==null || isNaN(data[i])) continue;
        lastData=data[i];
        result[i]=lastData; //第一天的数据
        break;
    }

    for(++i;i<data.length;++i)
    {
        result[i]=(m*data[i]+(n-m)*lastData)/n;
        lastData=result[i];
    }

    return result;
}


/*
    求动态移动平均.
    用法: DMA(X,A),求X的动态移动平均.
    算法: 若Y=DMA(X,A)则 Y=A*X+(1-A)*Y',其中Y'表示上一周期Y值,A必须小于1.
    例如:DMA(CLOSE,VOL/CAPITAL)表示求以换手率作平滑因子的平均价
*/
HQIndexFormula.DMA=function(data,data2)
{
    var result = [];
    if (data.length<0 || data.length!=data2.length) return result;

    var index=0;
    for(;index<data.length;++index)
    {
        if (data[index]!=null && !isNaN(data[index]) && data2[index]!=null && !isNaN(data2[index]))
        {
            result[index]=data[index];
            break;
        }
    }

    for(index=index+1;index<data.length;++index)
    {
        if (data[index]==null || data2[index]==null)
            result[index]=null;
        else
        {
            if (data[index]<1)
                result[index]=(data2[index]*data[index])+(1-data2[index])*result[index-1];
            else
                result[index]= data[index];
        }
    }

    return result;
}


HQIndexFormula.HHV=function(data,n)
{
    var result = [];
    if (n>data.length) return result;

    var max=-10000;
    for(var i=n,j=0;i<data.length;++i,++j)
    {
        if(i<n+max)
        {
            max=data[i]<data[max]?max:i;
        }
        else
        {
            for(j=(max=i-n+1)+1;j<=i;++j)
            {
                if(data[j]>data[max])
                    max = j;
            }
        }

        result[i] = data[max];
    }

    return result;
}

HQIndexFormula.LLV=function(data,n)
{
    var result = [];
    if (n>data.length) return result;

    var min=-10000;

    for(var i=n;i<data.length;++i,++j)
    {
        if(i<n+min)
        {
            min=data[i]>data[min]?min:i;
        }
        else
        {
            for(var j=(min=i-n+1)+1;j<=i;++j)
            {
                if(data[j]<data[min])
                    min = j;
            }
        }
        result[i] = data[min];
    }

    return result;
}

HQIndexFormula.REF=function(data,n)
{
    var result=[];

    if (data.length<=0) return result;
    if (n>=data.length) return result;

    result=data.slice(0,data.length-n);

    for(var i=0;i<n;++i)
        result.unshift(null);

    return result;
}

HQIndexFormula.REFDATE=function(data,n)
{
    var result=[];

    if (data.length<=0) return result;

    //暂时写死取最后一个
    n=data.length-1;
    for(var i in data)
    {
        result[i]=data[n];
    }

    return result;
}



HQIndexFormula.SUM=function(data,n)
{
    var result=[];

    if (n==0)
    {
        result[0]=data[0];

        for (var i=1; i<data.length; ++i)
        {
            result[i] = result[i-1]+data[i];
        }
    }
    else
    {

        for(var i=n-1,j=0;i<data.length;++i,++j)
        {
            for(var k=0;k<n;++k)
            {
                if (k==0) result[i]=data[k+j];
                else result[i]+=data[k+j];
            }
        }
    }

    return result;
}

//两个数组相减
HQIndexFormula.ARRAY_SUBTRACT=function(data,data2)
{
    var result=[];
    var IsNumber=typeof(data2)=="number";
    if (IsNumber)
    {
        for(var i in data)
        {
            if (data[i]==null || isNaN(data[i]))
                result[i]=null;
            else
                result[i]=data[i]-data2;
        }
    }
    else
    {
        var count=Math.max(data.length,data2.length)

        for(var i=0;i<count;++i)
        {
            if (i<data.length && i<data2.length)
            {
                if (data[i]==null || data2[i]==null) result[i]=null;
                else result[i]=data[i]-data2[i];
            }
            else
                result[i]=null;
        }
    }

    return result;
}

//数组 data>data2比较 返回 0/1 数组
HQIndexFormula.ARRAY_GT=function(data,data2)
{
    var result=[];
    var IsNumber=typeof(data2)=="number";
    if (IsNumber)
    {
        for(var i in data)
        {
            result[i]=(data[i]>data2 ? 1:0);
        }
    }
    else
    {
        var count=Math.max(data.length,data2.length)

        for(var i=0;i<count;++i)
        {
            if (i<data.length && i<data2.length)
                result[i]=data[i]>data2[i] ? 1:0;
            else
                result[i]=null;
        }
    }

    return result;
}

//数组 data>=data2比较 返回 0/1 数组
HQIndexFormula.ARRAY_GTE=function(data,data2)
{
    var result=[];
    var IsNumber=typeof(data2)=="number";
    if (IsNumber)
    {
        for(var i in data)
        {
            result[i]=(data[i]>=data2 ? 1:0);
        }
    }
    else
    {
        var count=Math.max(data.length,data2.length)

        for(var i=0;i<count;++i)
        {
            if (i<data.length && i<data2.length)
                result[i]=data[i]>=data2[i] ? 1:0;
            else
                result[i]=null;
        }
    }

    return result;
}

//数组 data<data2比较 返回 0/1 数组
HQIndexFormula.ARRAY_LT=function(data,data2)
{
    var result=[];
    var IsNumber=typeof(data2)=="number";
    if (IsNumber)
    {
        for(var i in data)
        {
            result[i]=(data[i]<data2 ? 1:0);
        }
    }
    else
    {
        var count=Math.max(data.length,data2.length)

        for(var i=0;i<count;++i)
        {
            if (i<data.length && i<data2.length)
                result[i]=data[i]<data2[i] ? 1:0;
            else
                result[i]=null;
        }
    }

    return result;
}

//数组 data<=data2比较 返回 0/1 数组
HQIndexFormula.ARRAY_LTE=function(data,data2)
{
    var result=[];
    var IsNumber=typeof(data2)=="number";
    if (IsNumber)
    {
        for(var i in data)
        {
            result[i]=(data[i]<=data2 ? 1:0);
        }
    }
    else
    {
        var count=Math.max(data.length,data2.length)

        for(var i=0;i<count;++i)
        {
            if (i<data.length && i<data2.length)
                result[i]=data[i]<=data2[i] ? 1:0;
            else
                result[i]=null;
        }
    }

    return result;
}

//数组 data==data2比较 返回 0/1 数组
HQIndexFormula.ARRAY_EQ=function(data,data2)
{
    var result=[];
    var IsNumber=typeof(data2)=="number";
    if (IsNumber)
    {
        for(var i in data)
        {
            result[i]=(data[i]==data2 ? 1:0);
        }
    }
    else
    {
        var count=Math.max(data.length,data2.length)

        for(var i=0;i<count;++i)
        {
            if (i<data.length && i<data2.length)
                result[i]=(data[i]==data2[i] ? 1:0);
            else
                result[i]=null;
        }
    }

    return result;
}

HQIndexFormula.ARRAY_IF=function(data,trueData,falseData)
{
    var result=[];
    var IsNumber=[typeof(trueData)=="number",typeof(falseData)=="number"];
    for(var i in data)
    {
        if (data[i])
        {
            if (IsNumber[0]) result[i]=trueData;
            else result[i]=trueData[i];
        }
        else
        {
            if (IsNumber[1]) result[i]=falseData;
            else result[i]=falseData[i];
        }
    }

    return result;
}

HQIndexFormula.ARRAY_AND=function(data,data2)
{
   var result=[];
    var IsNumber=typeof(data2)=="number";
    if (IsNumber)
    {
        for(var i in data)
        {
            result[i]=(data[i] && data2? 1:0);
        }
    }
    else
    {
        var count=Math.max(data.length,data2.length)

        for(var i=0;i<count;++i)
        {
            if (i<data.length && i<data2.length)
                result[i]=(data[i] && data2[i] ? 1:0);
            else
                result[i]=0;
        }
    }

    return result;
}
HQIndexFormula.ARRAY_OR=function(data, data2)
{
    var result=[];
    var IsNumber=typeof(data2)=="number";
    if (IsNumber)
    {
        for(var i in data)
        {
            result[i]=(data[i] || data2? 1:0);
        }
    }
    else
    {
        var count=Math.max(data.length,data2.length)

        for(var i=0;i<count;++i)
        {
            if (i < data.length && data[i])
            {
                result[i] = 1;
                continue;
            }
            if (i < data2.length && data2[i])
            {
                result[i] = 1;
                continue;
            }
            result[i] = 0;    
        }
    }

    return result;
}
//数组相乘
//支持多个参数累乘 如:HQIndexFormula.ARRAY_MULTIPLY(data,data2,data3,data3) =data*data2*data3*data4
HQIndexFormula.ARRAY_MULTIPLY=function(data,data2)
{
    if (arguments.length==2)
    {
        var result=[];
        var IsNumber=typeof(data2)=="number";
        if (IsNumber)
        {
            for(var i in data)
            {
                if (data[i]==null || isNaN(data[i]))
                    result[i]=null;
                else
                    result[i]=data[i]*data2;
            }
        }
        else
        {
            var count=Math.max(data.length,data2.length);
            for(var i=0;i<count;++i)
            {
                if (i<data.length && i<data2.length)
                    result[i]=data[i]*data2[i];
                else
                    result[i]=null;
            }
        }

        return result;
    }

    var result=HQIndexFormula.ARRAY_MULTIPLY(arguments[0],arguments[1]);

    for(var i=2;i<arguments.length;++i)
    {
        result=HQIndexFormula.ARRAY_MULTIPLY(result,arguments[i]);
    }

    return result;
}

//数组相除
HQIndexFormula.ARRAY_DIVIDE=function(data,data2)
{
    var result=[];
    var IsNumber=typeof(data2)=="number";
    if (IsNumber)
    {
        for(var i in data)
        {
            result[i]=data[i]/data2;
        }
    }
    else
    {
        var count=Math.max(data.length,data2.length);
        for(var i=0;i<count;++i)
        {
            if (i<data.length && i<data2.length)
            {
                if(data[i]==null || data2[i]==null || isNaN(data[i]) || isNaN(data2[i]))
                    result[i]=null;
                else if (data2[i]==0)
                    result[i]=null;
                else
                    result[i]=data[i]/data2[i];
            }
            else
                result[i]=null;
        }
    }

    return result;
}

//数组相加
//支持多个参数累加 如:HQIndexFormula.ARRAY_ADD(data,data2,data3,data3) =data+data2+data3+data4
HQIndexFormula.ARRAY_ADD=function(data,data2)
{
    if (arguments.length==2)
    {
        var result=[];
        var IsNumber=typeof(data2)=="number";
        if (IsNumber)
        {
            for(var i in data)
            {
                result[i]=data[i]+data2;
            }
        }
        else
        {
            var count=Math.max(data.length,data2.length);
            for(var i=0;i<count;++i)
            {
                if (i<data.length && i<data2.length)
                {
                    if (data[i]==null || data2[i]==null || isNaN(data[i]) || isNaN(data2[i])) result[i]=null
                    else result[i]=data[i]+data2[i];
                }
                else
                {
                    result[i]=null;
                }
            }
        }

        return result;
    }

    var result=HQIndexFormula.ARRAY_ADD(arguments[0],arguments[1]);

    for(var i=2;i<arguments.length;++i)
    {
        result=HQIndexFormula.ARRAY_ADD(result,arguments[i]);
    }

    return result;
}

HQIndexFormula.MAX=function(data,data2)
{
    var result=[];
    var IsNumber=typeof(data2)=="number";
    if (IsNumber)
    {
        for(var i in data)
        {
            if (data[i]==null) result[i]=null;
            else result[i]=Math.max(data[i],data2);
        }
    }
    else
    {
        var count=Math.max(data.length,data2.length);
        for(var i=0;i<count;++i)
        {
            if (i<data.length && i<data2.length)
            {
                if (data[i]==null || data2[i]==null) result[i]=null;
                else result[i]=Math.max(data[i],data2[i]);
            }
            else
                result[i]=null;
        }
    }

    return result;
}

HQIndexFormula.MIN=function(data,data2)
{
    var result=[];
    var IsNumber=typeof(data2)=="number";
    if (IsNumber)
    {
        for(var i in data)
        {
            if (data[i]==null) result[i]=null;
            else result[i]=Math.min(data[i],data2);
        }
    }
    else
    {
        var count=Math.max(data.length,data2.length);
        for(var i=0;i<count;++i)
        {
            if (i<data.length && i<data2.length)
            {
                if (data[i]==null || data2[i]==null) result[i]=null;
                else result[i]=Math.min(data[i],data2[i]);
            }
            else
                result[i]=null;
        }
    }

    return result;
}


HQIndexFormula.ABS=function(data)
{
    var result=[];
    for(var i in data)
    {
        if (data[i]==null) result[i]=null;
        else result[i]=Math.abs(data[i]);
    }

    return result;
}


HQIndexFormula.MA=function(data,dayCount)
{
    var result=[];

    for (var i = 0, len = data.length; i < len; i++)
    {
        if (i < dayCount)
        {
            result[i]=null;
            continue;
        }

        var sum = 0;
        for (var j = 0; j < dayCount; j++)
        {
            sum += data[i - j];
        }
        result[i]=sum / dayCount;
    }
    return result;
}

/*
    加权移动平均
    返回加权移动平均
    用法:EXPMA(X,M):X的M日加权移动平均
    EXPMA[i]=buffer[i]*para+(1-para)*EXPMA[i-1] para=2/(1+__para)
*/
HQIndexFormula.EXPMA=function(data,dayCount)
{
    var result=[];
    if (dayCount>=data.length) return result;

    var i=dayCount;
    for(;i<data.length;++i) //获取第1个有效数据
    {
        if (data[i]!=null)
        {
            result[i]=data[i];
            break;
        }
    }

    for (i=i+1; i < data.length; ++i)
    {
        if (result[i-1]!=null && data[i]!=null)
            result[i]=(2*data[i]+(dayCount-1)*result[i-1])/(dayCount+1);
        else if (result[i-1]!=null)
            result[i]=result[i-1];
    }

    return result;
}

//加权平滑平均,MEMA[i]=SMA[i]*para+(1-para)*SMA[i-1] para=2/(1+__para)
HQIndexFormula.EXPMEMA=function(data,dayCount)
{
    var result=[];
    if (dayCount>=data.length) return result;

    var index=0;
    for(;index<data.length;++index)
    {
        if (data[index] && !isNaN(data[index])) break;
    }

    var sum=0;
    for(var i=0; index<data.length && i<dayCount;++i, ++index)
    {
        if (data[index] && !isNaN(data[index]))
            sum+=data[index];
        else
            sum+=data[index-1];
    }

    result[index-1]=sum/dayCount;
    for(;index<data.length;++index)
	{
        if(result[index-1]!=null && data[index]!=null)
            result[index]=(2*data[index]+(dayCount-1)*result[index-1])/(dayCount+1);
        else if(result[index-1]!=null)
            result[index] = result[index-1];
	}

    return result;
}


HQIndexFormula.STD=function(data,n)
{
    var result=[];

    var total=0;
    var averageData=[]; //平均值
    for(var i=n-1;i<data.length;++i)
    {
        total=0;
        for(var j=0;j<n;++j)
        {
            total+=data[i-j];
        }

        averageData[i]=total/n;
    }

    for(var i=n-1;i<data.length;++i)
    {
        total=0;
        for(var j=0;j<n;++j)
        {
            total+=Math.pow((data[i-j]-averageData[i]),2);
        }

        result[i]=Math.sqrt(total/n);
    }


    return result;
}

//平均绝对方差
HQIndexFormula.AVEDEV=function(data,n)
{
    var result=[];

    var total=0;
    var averageData=[]; //平均值
    for(var i=n-1;i<data.length;++i)
    {
        total=0;
        for(var j=0;j<n;++j)
        {
            total+=data[i-j];
        }

        averageData[i]=total/n;
    }

    for(var i=n-1;i<data.length;++i)
    {
        total=0;
        for(var j=0;j<n;++j)
        {
            total+=Math.abs(data[i-j]-averageData[i]);
        }

        result[i]=total/n;
    }


    return result;
}

HQIndexFormula.COUNT=function(data,n)
{
    var result=[];


    for(var i=n-1;i<data.length;++i)
    {
        var count=0;
        for(var j=0;j<n;++j)
        {
            if (data[i-j]) ++count;
        }

        result[i]=count;
    }

    return result;
}

//上穿
HQIndexFormula.CROSS=function(data,data2)
{
    var result=[];
    if (data.length!=data2.length) return result=[];

    var index=0;
    for(;index<data.length;++index)
    {
        if (data[index]!=null && !isNaN(data[index])  && data2[index]!=null && isNaN(data2[index]))
            break;
    }

    for(++index;index<data.length;++index)
    {
        result[index]= (data[index]>data2[index]&&data[index-1]<data2[index-1])?1:0;
    }

    return result;
}

//累乘
HQIndexFormula.MULAR=function(data,n)
{
    var result=[];
    if(data.length<n) return result;

    var index=n;
    for(;index<data.length;++index)
    {
        if (data[index]!=null && !isNaN(data[index]))
        {
            result[index]=data[index];
            break;
        }
    }

    for(++index;index<data.length;++index)
    {
        result[index]=result[index-1]*data[index];
    }

    return result;
}


HQIndexFormula.STICKLINE=function(data,price1,price2)
{
    var result=[];
    if(data.length<=0) return result;

    var IsNumber=typeof(price1)=="number";
    var IsNumber2=typeof(price2)=="number";
   

    for(var i in data)
    {
        result[i]=null;
        if (isNaN(data[i])) continue;
        if (!data[i]) continue;

        if (IsNumber && IsNumber2)
        {
            result[i]={Value:price1,Value2:price2};
        }
        else if (IsNumber && !IsNumber2)
        {
            if (isNaN(price2[i])) continue;
            result[i]={Value:price1,Value2:price2[i]};
        }
        else if (!IsNumber && IsNumber2)
        {
            if (isNaN(price1[i])) continue;
            result[i]={Value:price1[i],Value2:price2};
        }
        else
        {
            if (isNaN(price1[i]) || isNaN(price2[i])) continue;
            result[i]={Value:price1[i],Value2:price2[i]};
        }
    }

    return result;
}

/////////////////////////////////////////////////////////////////////////////////////////////
//  K线图 控件
//  this.ChartPaint[0] K线画法 这个不要修改
//
//
function KLineChartContainer(uielement)
{
    var _self =this;
    this.newMethod=JSChartContainer;   //派生
    this.newMethod(uielement);
    delete this.newMethod;

    this.ClassName='KLineChartContainer';
    this.WindowIndex=new Array();
    this.ColorIndex;                    //五彩K线
    this.TradeIndex;                    //交易指标/专家系统
    this.Symbol;
    this.Name;
    this.Period=0;                      //周期 0=日线 1=周线 2=月线 3=年线 4=1分钟 5=5分钟 6=15分钟 7=30分钟 8=60分钟
    this.Right=0;                       //复权 0 不复权 1 前复权 2 后复权
    this.SourceData;                    //原始的历史数据
    this.MaxReqeustDataCount=3000;      //数据个数
    this.MaxRequestMinuteDayCount=5;    //分钟数据请求的天数
    this.PageSize=200;                  //每页数据个数
    this.KLineDrawType=0;
    this.ScriptErrorCallback;           //脚本执行错误回调
    this.FlowCapitalReady=false;        //流通股本是否下载完成
    this.StockChipWidth=230;            //移动筹码宽度

    //自动更新设置
    this.IsAutoUpdate=false;                    //是否自动更新行情数据
    this.AutoUpdateFrequency=30000;             //30秒更新一次数据

    //this.KLineApiUrl="http://opensource.zealink.com/API/KLine2";                  //历史K线api地址
    this.KLineApiUrl=g_JSChartResource.Domain+"/API/KLine2";                        //历史K线api地址
    this.MinuteKLineApiUrl=g_JSChartResource.Domain+'/API/KLine3';                  //历史分钟数据
    this.RealtimeApiUrl=g_JSChartResource.Domain+"/API/Stock";                      //实时行情api地址
    this.KLineMatchUrl=g_JSChartResource.Domain+"/API/KLineMatch";                  //形态匹配
    this.StockHistoryDayApiUrl= g_JSChartResource.Domain+'/API/StockHistoryDay';    //股票历史数据

    this.MinuteDialog;      //双击历史K线 弹出分钟走势图
    this.RightMenu;         //右键菜单
    this.ChartPictureMenu;  //画图工具 单个图形设置菜单

    this.OnWheel=function(e)
    {
        console.log('[KLineChartContainer::OnWheel]',e);
        var x = e.clientX-this.UIElement.getBoundingClientRect().left;
        var y = e.clientY-this.UIElement.getBoundingClientRect().top;

        var isInClient=false;
        this.Canvas.beginPath();
        this.Canvas.rect(this.Frame.ChartBorder.GetLeft(),this.Frame.ChartBorder.GetTop(),this.Frame.ChartBorder.GetWidth(),this.Frame.ChartBorder.GetHeight());
        isInClient=this.Canvas.isPointInPath(x,y);
        
        if (isInClient && e.wheelDelta<0)       //缩小
        {
            var cursorIndex={};
            cursorIndex.Index=parseInt(Math.abs(this.CursorIndex-0.5).toFixed(0));
            if (this.Frame.ZoomDown(cursorIndex))
            {
                this.CursorIndex=cursorIndex.Index;
                this.UpdataDataoffset();
                this.UpdatePointByCursorIndex();
                this.UpdateFrameMaxMin();
                this.Draw();
            }
        }
        else if (isInClient && e.wheelDelta>0)  //放大
        {
            var cursorIndex={};
            cursorIndex.Index=parseInt(Math.abs(this.CursorIndex-0.5).toFixed(0));
            if (this.Frame.ZoomUp(cursorIndex))
            {
                this.CursorIndex=cursorIndex.Index;
                this.UpdatePointByCursorIndex();
                this.UpdataDataoffset();
                this.UpdateFrameMaxMin();
                this.Draw();
            }
        }

        if(e.preventDefault) e.preventDefault();
        else e.returnValue = false;
    }

    //创建
    //windowCount 窗口个数
    this.Create=function(windowCount)
    {
        this.UIElement.JSChartContainer=this;

        //创建十字光标
        this.ChartCorssCursor=new ChartCorssCursor();
        this.ChartCorssCursor.Canvas=this.Canvas;
        this.ChartCorssCursor.StringFormatX=new HQDateStringFormat();
        this.ChartCorssCursor.StringFormatY=new HQPriceStringFormat();

        //创建等待提示
        this.ChartSplashPaint = new ChartSplashPaint();
        this.ChartSplashPaint.Canvas = this.Canvas;

        //创建框架容器
        this.Frame=new HQTradeFrame();
        this.Frame.ChartBorder=new ChartBorder();
        this.Frame.ChartBorder.UIElement=this.UIElement;
        this.Frame.ChartBorder.Top=30;
        this.Frame.ChartBorder.Left=5;
        this.Frame.ChartBorder.Bottom=20;
        this.Frame.Canvas=this.Canvas;
        this.ChartCorssCursor.Frame=this.Frame; //十字光标绑定框架
        this.ChartSplashPaint.Frame = this.Frame;

        this.CreateChildWindow(windowCount);
        this.CreateMainKLine();

        //子窗口动态标题
        for(var i in this.Frame.SubFrame)
        {
            var titlePaint=new DynamicChartTitlePainting();
            titlePaint.Frame=this.Frame.SubFrame[i].Frame;
            titlePaint.Canvas=this.Canvas;

            this.TitlePaint.push(titlePaint);
        }

        this.UIElement.addEventListener("keydown", OnKeyDown, true);            //键盘消息
        this.UIElement.addEventListener("wheel", OnWheel, true);                //上下滚动消息
    }

    //创建子窗口
    this.CreateChildWindow=function(windowCount)
    {
        for(var i=0;i<windowCount;++i)
        {
            var border=new ChartBorder();
            border.UIElement=this.UIElement;

            var frame=new KLineFrame();
            frame.Canvas=this.Canvas;
            frame.ChartBorder=border;
            frame.Identify=i;                   //窗口序号

            if (this.ModifyIndexDialog) frame.ModifyIndexEvent=this.ModifyIndexDialog.DoModal;        //绑定菜单事件
            if (this.ChangeIndexDialog) frame.ChangeIndexEvent=this.ChangeIndexDialog.DoModal;

            frame.HorizontalMax=20;
            frame.HorizontalMin=10;

            if (i==0)
            {
                frame.YSplitOperator=new FrameSplitKLinePriceY();
                frame.YSplitOperator.FrameSplitData=this.FrameSplitData.get('price');
                var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
                border.BottomSpace=12*pixelTatio;  //主图上下留空间
                border.TopSpace=12*pixelTatio;
            }
            else
            {
                frame.YSplitOperator=new FrameSplitY();
                frame.YSplitOperator.FrameSplitData=this.FrameSplitData.get('double');
                //frame.IsLocked = true;
            }

            frame.YSplitOperator.Frame=frame;
            frame.YSplitOperator.ChartBorder=border;
            frame.XSplitOperator=new FrameSplitKLineX();
            frame.XSplitOperator.Frame=frame;
            frame.XSplitOperator.ChartBorder=border;

            if (i!=windowCount-1) frame.XSplitOperator.ShowText=false;

            for(var j=frame.HorizontalMin;j<=frame.HorizontalMax;j+=1)
            {
                frame.HorizontalInfo[j]= new CoordinateInfo();
                frame.HorizontalInfo[j].Value=j;
                if (i==0 && j==frame.HorizontalMin) continue;

                frame.HorizontalInfo[j].Message[1]=j.toString();
                frame.HorizontalInfo[j].Font="14px 微软雅黑";
            }

            var subFrame=new SubFrameItem();
            subFrame.Frame=frame;
            if (i==0)
                subFrame.Height=20;
            else
                subFrame.Height=10;

            this.Frame.SubFrame[i]=subFrame;
        }
    }

    this.CreateSubFrameItem=function(id)
    {
        var border=new ChartBorder();
        border.UIElement=this.UIElement;

        var frame=new KLineFrame();
        frame.Canvas=this.Canvas;
        frame.ChartBorder=border;
        frame.Identify=id;                   //窗口序号

        if (this.ModifyIndexDialog) frame.ModifyIndexEvent=this.ModifyIndexDialog.DoModal;        //绑定菜单事件
        if (this.ChangeIndexDialog) frame.ChangeIndexEvent=this.ChangeIndexDialog.DoModal;

        frame.HorizontalMax=20;
        frame.HorizontalMin=10;
        frame.YSplitOperator=new FrameSplitY();
        frame.YSplitOperator.FrameSplitData=this.FrameSplitData.get('double');
        frame.YSplitOperator.Frame=frame;
        frame.YSplitOperator.ChartBorder=border;
        frame.XSplitOperator=new FrameSplitKLineX();
        frame.XSplitOperator.Frame=frame;
        frame.XSplitOperator.ChartBorder=border;
        frame.XSplitOperator.ShowText=false;

        //K线数据绑定
        var xPointCouont=this.Frame.SubFrame[0].Frame.XPointCount;
        frame.XPointCount=xPointCouont;
        frame.Data=this.ChartPaint[0].Data;

        for(var j=frame.HorizontalMin;j<=frame.HorizontalMax;j+=1)
        {
            frame.HorizontalInfo[j]= new CoordinateInfo();
            frame.HorizontalInfo[j].Value=j;
            frame.HorizontalInfo[j].Message[1]=j.toString();
            frame.HorizontalInfo[j].Font="14px 微软雅黑";
        }

        var subFrame=new SubFrameItem();
        subFrame.Frame=frame;
        subFrame.Height=10;

        return subFrame;
    }

    //创建主图K线画法
    this.CreateMainKLine=function()
    {
        var kline=new ChartKLine();
        kline.Canvas=this.Canvas;
        kline.ChartBorder=this.Frame.SubFrame[0].Frame.ChartBorder;
        kline.ChartFrame=this.Frame.SubFrame[0].Frame;
        kline.Name="Main-KLine";
        kline.DrawType=this.KLineDrawType;

        this.ChartPaint[0]=kline;

        this.TitlePaint[0]=new DynamicKLineTitlePainting();
        this.TitlePaint[0].Frame=this.Frame.SubFrame[0].Frame;
        this.TitlePaint[0].Canvas=this.Canvas;
        this.TitlePaint[0].OverlayChartPaint=this.OverlayChartPaint;    //绑定叠加

        //主图叠加画法
        var paint=new ChartOverlayKLine();
        paint.Canvas=this.Canvas;
        paint.ChartBorder=this.Frame.SubFrame[0].Frame.ChartBorder;
        paint.ChartFrame=this.Frame.SubFrame[0].Frame;
        paint.Name="Overlay-KLine";
        paint.DrawType=this.KLineDrawType;
        this.OverlayChartPaint[0]=paint;

        

    }

    //绑定主图K线数据
    this.BindMainData=function(hisData,showCount)
    {
        this.ChartPaint[0].Data=hisData;
        this.ChartPaint[0].Symbol=this.Symbol;
        for(var i in this.Frame.SubFrame)
        {
            var item =this.Frame.SubFrame[i].Frame;
            item.XPointCount=showCount;
            item.Data=this.ChartPaint[0].Data;
        }

        this.TitlePaint[0].Data=this.ChartPaint[0].Data;                    //动态标题
        this.TitlePaint[0].Symbol=this.Symbol;
        this.TitlePaint[0].Name=this.Name;

        this.ChartCorssCursor.StringFormatX.Data=this.ChartPaint[0].Data;   //十字光标
        this.Frame.Data=this.ChartPaint[0].Data;

        this.OverlayChartPaint[0].MainData=this.ChartPaint[0].Data;         //K线叠加

        var dataOffset=hisData.Data.length-showCount;
        if (dataOffset<0) dataOffset=0;
        this.ChartPaint[0].Data.DataOffset=dataOffset;

        this.ChartCorssCursor.StringFormatY.Symbol=this.Symbol;

        this.CursorIndex=showCount;
        if (this.CursorIndex+dataOffset>=hisData.Data.length) this.CursorIndex=dataOffset;
    }

    //创建指定窗口指标
    this.CreateWindowIndex=function(windowIndex)
    {
        this.WindowIndex[windowIndex].Create(this,windowIndex);
    }

    this.BindIndexData=function(windowIndex,hisData)
    {
        if (!this.WindowIndex[windowIndex]) return;

        if (typeof(this.WindowIndex[windowIndex].RequestData)=="function")  //数据需要另外下载的.
        {
            this.WindowIndex[windowIndex].RequestData(this,windowIndex,hisData);
            return;
        }
        if (typeof(this.WindowIndex[windowIndex].ExecuteScript)=='function')
        {
            this.WindowIndex[windowIndex].ExecuteScript(this,windowIndex,hisData);
            return;
        }

        this.WindowIndex[windowIndex].BindData(this,windowIndex,hisData);
    }

    //执行指示(专家指示 五彩K线)
    this.BindInstructionIndexData=function(hisData)
    {
        if (this.ColorIndex && typeof(this.ColorIndex.ExecuteScript)=='function')   //五彩K线
        {
            this.ColorIndex.ExecuteScript(this,0,hisData);
        }

        if (this.TradeIndex && typeof(this.TradeIndex.ExecuteScript)=='function')   //交易指标
        {
            this.TradeIndex.ExecuteScript(this,0,hisData);
        }
    }

    //获取子窗口的所有画法
    this.GetChartPaint=function(windowIndex)
    {
        var paint=new Array();
        for(var i in this.ChartPaint)
        {
            if (i==0) continue; //第1个K线数据除外

            var item=this.ChartPaint[i];
            if (item.ChartFrame==this.Frame.SubFrame[windowIndex].Frame)
                paint.push(item);
        }

        return paint;
    }

    this.RequestHistoryData=function()
    {
        var self=this;
        this.ChartSplashPaint.IsEnableSplash = true;
        this.FlowCapitalReady=false;
        this.Draw();
        $.ajax({
            url: this.KLineApiUrl,
            data:
            {
                "field": [
                    "name",
                    "symbol",
                    "yclose",
                    "open",
                    "price",
                    "high",
                    "low",
                    "vol"
                ],
                "symbol": self.Symbol,
                "start": -1,
                "count": self.MaxReqeustDataCount
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (data)
            {
                self.ChartSplashPaint.IsEnableSplash = false;
                self.RecvHistoryData(data);
                self.AutoUpdate();
            }
        });
    }

    this.RecvHistoryData=function(data)
    {
        var aryDayData=KLineChartContainer.JsonDataToHistoryData(data);

        //原始数据
        var sourceData=new ChartData();
        sourceData.Data=aryDayData;
        sourceData.DataType=0;      //0=日线数据 1=分钟数据

        //显示的数据
        var bindData=new ChartData();
        bindData.Data=aryDayData;
        bindData.Right=this.Right;
        bindData.Period=this.Period;
        bindData.DataType=0;

        if (bindData.Right>0)    //复权
        {
            var rightData=bindData.GetRightDate(bindData.Right);
            bindData.Data=rightData;
        }

        if (bindData.Period>0 && bindData.Period<=3)   //周期数据
        {
            var periodData=bindData.GetPeriodData(bindData.Period);
            bindData.Data=periodData;
        }

        //绑定数据
        this.SourceData=sourceData;
        this.Symbol=data.symbol;
        this.Name=data.name;
        this.BindMainData(bindData,this.PageSize);
        this.BindInstructionIndexData(bindData);    //执行指示脚本

        var firstSubFrame;
        for(var i=0; i<this.Frame.SubFrame.length; ++i) //执行指标
        {
            if (i==0) firstSubFrame=this.Frame.SubFrame[i].Frame;
            this.BindIndexData(i,bindData);
        }

        if (firstSubFrame && firstSubFrame.YSplitOperator)
        {
            firstSubFrame.YSplitOperator.Symbol=this.Symbol;
            firstSubFrame.YSplitOperator.Data=this.ChartPaint[0].Data;         //K线数据
        }
        
        this.RequestFlowCapitalData();      //请求流通股本数据 (主数据下载完再下载)
        this.RequestOverlayHistoryData();   //请求叠加数据 (主数据下载完再下载)

        //刷新画图
        this.UpdataDataoffset();           //更新数据偏移
        this.UpdatePointByCursorIndex();   //更新十字光标位子
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Frame.SetSizeChage(true);
        this.Draw();
    }

    this.ReqeustHistoryMinuteData=function()
    {
        var self=this;
        this.ChartSplashPaint.IsEnableSplash = true;
        this.FlowCapitalReady=false;
        this.Draw();
        $.ajax({
            url: this.MinuteKLineApiUrl,
            data:
            {
                "field": [
                    "name",
                    "symbol",
                    "yclose",
                    "open",
                    "price",
                    "high",
                    "low",
                    "vol"
                ],
                "symbol": self.Symbol,
                "start": -1,
                "count": self.MaxRequestMinuteDayCount
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (data)
            {
                self.ChartSplashPaint.IsEnableSplash = false;
                self.RecvMinuteHistoryData(data);
            }
        });
    }


    this.RecvMinuteHistoryData=function(data)
    {
        var aryDayData=KLineChartContainer.JsonDataToMinuteHistoryData(data);
        //原始数据
        var sourceData=new ChartData();
        sourceData.Data=aryDayData;
        sourceData.DataType=1;      //0=日线数据 1=分钟数据

        //显示的数据
        var bindData=new ChartData();
        bindData.Data=aryDayData;
        bindData.Right=this.Right;
        bindData.Period=this.Period;
        bindData.DataType=1; 

        if (bindData.Period>=5)   //周期数据
        {
            var periodData=sourceData.GetPeriodData(bindData.Period);
            bindData.Data=periodData;
        }

        //绑定数据
        this.SourceData=sourceData;
        this.Symbol=data.symbol;
        this.Name=data.name;
        this.BindMainData(bindData,this.PageSize);
        this.BindInstructionIndexData(bindData);    //执行指示脚本

        var firstSubFrame;
        for(var i=0; i<this.Frame.SubFrame.length; ++i) //执行指标
        {
            if (i==0) firstSubFrame=this.Frame.SubFrame[i].Frame;
            this.BindIndexData(i,bindData);
        }

        if (firstSubFrame && firstSubFrame.YSplitOperator)
        {
            firstSubFrame.YSplitOperator.Symbol=this.Symbol;
            firstSubFrame.YSplitOperator.Data=this.ChartPaint[0].Data;         //K线数据
        }

        this.OverlayChartPaint[0].Data=null; //分钟数据不支持叠加 清空

        this.RequestFlowCapitalData();      //请求流通股本数据 (主数据下载完再下载)

        //刷新画图
        this.UpdataDataoffset();           //更新数据偏移
        this.UpdatePointByCursorIndex();   //更新十字光标位子
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Frame.SetSizeChage(true);
        this.Draw();
    }

    //请求实时行情数据
    this.ReqeustRealtimeData=function()
    {
        var self=this;

        $.ajax({
            url: this.RealtimeApiUrl,
            data:
            {
                "field": [
                    "name",
                    "symbol",
                    "yclose",
                    "open",
                    "price",
                    "high",
                    "low",
                    "vol",
                    "amount",
                    "date",
                    "time"
                ],
                "symbol": [self.Symbol],
                "start": -1
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (data)
            {
                self.RecvRealtimeData(data);
                self.AutoUpdate();
            }
        });
    }

    this.RecvRealtimeData=function(data)
    {
        var realtimeData=KLineChartContainer.JsonDataToRealtimeData(data);
        if (this.Symbol!=data.symbol) return;

        if (this.SourceData.Data[this.SourceData.Data.length-1].Date=!realtimeData.Date) return;

        //实时行情数据更新
        var item =this.SourceData.Data[this.SourceData.Data.length-1];
        item.Close=realtimeData.Close;
        item.High=realtimeData.High;
        item.Low=realtimeData.Low;
        item.Vol=realtimeData.Vol;
        item.Amount=realtimeData.Amount;

        var bindData=new ChartData();
        bindData.Data=this.SourceData.Data;
        bindData.Period=this.Period;
        bindData.Right=this.Right;
        bindData.DataType=this.SourceData.DataType;

        if (bindData.Right>0 && bindData.Period<=3)    //复权(日线数据才复权)
        {
            var rightData=bindData.GetRightDate(bindData.Right);
            bindData.Data=rightData;
        }

        if (bindData.Period>0 && bindData.Period!=4)   //周期数据 (0= 日线,4=1分钟线 不需要处理)
        {
            var periodData=bindData.GetPeriodData(bindData.Period);
            bindData.Data=periodData;
        }

        //绑定数据
        this.BindMainData(bindData,this.PageSize);
        this.BindInstructionIndexData(bindData);    //执行指示脚本

        for(var i=0; i<this.Frame.SubFrame.length; ++i)
        {
            this.BindIndexData(i,bindData);
        }

        //刷新画图
        this.UpdataDataoffset();           //更新数据偏移
        this.UpdatePointByCursorIndex();   //更新十字光标位子
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Frame.SetSizeChage(true);
        this.Draw();
        
    }

    //周期切换
    this.ChangePeriod=function(period)
    {
        if (this.Period==period) return;

        var isDataTypeChange=false;
        switch(period)
        {
            case 0:     //日线
            case 1:     //周
            case 2:     //月
            case 3:     //年
                if (this.SourceData.DataType!=0) isDataTypeChange=true;
                break;
            case 4:     //1分钟
            case 5:     //5分钟
            case 6:     //15分钟
            case 7:     //30分钟
            case 8:     //60分钟
                if (this.SourceData.DataType!=1) isDataTypeChange=true;
                break;
        }
        
        this.Period=period;
        if (isDataTypeChange==false)
        {
            this.Update();
            return;
        }

        if (this.Period<=3)
        {
            this.RequestHistoryData();                  //请求日线数据
            this.ReqeustKLineInfoData();
        }
        else 
        {
            this.ReqeustHistoryMinuteData();            //请求分钟数据
        }  
    }

    //复权切换
    this.ChangeRight=function(right)
    {
        if (IsIndexSymbol(this.Symbol)) return; //指数没有复权

        if (right<0 || right>2) return;

        if (this.Right==right) return;

        this.Right=right;

        this.Update();
    }

    //删除某一个窗口的指标
    this.DeleteIndexPaint=function(windowIndex)
    {
        let paint=new Array();  //踢出当前窗口的指标画法
        for(let i in this.ChartPaint)
        {
            let item=this.ChartPaint[i];

            if (i==0 || item.ChartFrame!=this.Frame.SubFrame[windowIndex].Frame)
                paint.push(item);
        }
        
        this.Frame.SubFrame[windowIndex].Frame.YSpecificMaxMin=null;    //清空指定最大最小值
        this.Frame.SubFrame[windowIndex].Frame.IsLocked=false;          //解除上锁
        this.Frame.SubFrame[windowIndex].Frame.YSplitScale = null;      //清空固定刻度

        this.ChartPaint=paint;

        //清空东条标题
        var titleIndex=windowIndex+1;
        this.TitlePaint[titleIndex].Data=[];
        this.TitlePaint[titleIndex].Title=null;
    }

    //显示隐藏主图K线
    this.ShowKLine=function(isShow)
    {
        if (this.ChartPaint.length<=0 || !this.ChartPaint[0]) return;
        this.ChartPaint[0].IsShow=isShow;
    }

    this.SetInstructionData=function(type,instructionData)
    {
        if (this.ChartPaint.length<=0 || !this.ChartPaint[0]) return;

        var title=this.TitlePaint[1];
        if (type==2) //五彩K线
        {
            this.ChartPaint[0].ColorData=instructionData.Data;
            if (title) title.ColorIndex={Name:instructionData.Name};
        }
        else if (type==1)   //专家指示
        {
            this.ChartPaint[0].TradeData={Sell:instructionData.Sell, Buy:instructionData.Buy};
            if (title) title.TradeIndex={Name:instructionData.Name}
        }
    }

    this.ChangeInstructionIndex=function(indexName)
    {
        let scriptData = new JSIndexScript();
        let indexInfo = scriptData.Get(indexName);
        if (!indexInfo) return;
        if(indexInfo.InstructionType!=1 && indexInfo.InstructionType!=2) return;

        indexInfo.ID=indexName;
        this.ChangeInstructionScriptIndex(indexInfo);
        
    }

    this.ChangeInstructionScriptIndex=function(indexData)
    {
        if (indexData.InstructionType==1)       //交易系统
        {
            this.TradeIndex=new ScriptIndex(indexData.Name,indexData.Script,indexData.Args,indexData);    //脚本执行
        }
        else if (indexData.InstructionType==2)  //五彩K线
        {
            this.ColorIndex=new ScriptIndex(indexData.Name,indexData.Script,indexData.Args,indexData);    //脚本执行
        }
        else
        {
            return;
        }

        var bindData=this.ChartPaint[0].Data;
        this.BindInstructionIndexData(bindData);

        this.UpdataDataoffset();           //更新数据偏移
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Draw();
    }

    this.CancelInstructionIndex=function()  //取消指示数据
    {
        if (this.ChartPaint.length<=0 || !this.ChartPaint[0]) return;

        this.ColorIndex=null;
        this.TradeIndex=null;
        this.ChartPaint[0].ColorData=null;  //五彩K线数据取消掉
        this.ChartPaint[0].TradeData=null;  //交易系统数据取消

        var title=this.TitlePaint[1];
        if (title)
        {
            title.TradeIndex=null;
            title.ColorIndex=null;
        }

        this.UpdataDataoffset();           //更新数据偏移
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Draw();
    }

    //切换成 脚本指标
    this.ChangeScriptIndex=function(windowIndex,indexData)
    {
        this.DeleteIndexPaint(windowIndex);
        this.WindowIndex[windowIndex]=new ScriptIndex(indexData.Name,indexData.Script,indexData.Args,indexData);    //脚本执行

        var bindData=this.ChartPaint[0].Data;
        this.BindIndexData(windowIndex,bindData);   //执行脚本

        this.UpdataDataoffset();           //更新数据偏移
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Draw();
    }

    //切换指标 指定切换窗口指标
    this.ChangeIndex=function(windowIndex,indexName)
    {
        var indexItem=JSIndexMap.Get(indexName);
        if (!indexItem) 
        {
            //查找系统指标
            let scriptData = new JSIndexScript();
            let indexInfo = scriptData.Get(indexName);
            if (!indexInfo) return;
            if (indexInfo.IsMainIndex) 
            {
                windowIndex = 0;  //主图指标只能在主图显示
            }
            else 
            {
                if (windowIndex == 0) windowIndex = 1;  //幅图指标,不能再主图显示
            }
            let indexData = 
            { 
                Name:indexInfo.Name, Script:indexInfo.Script, Args: indexInfo.Args, ID:indexName ,
                //扩展属性 可以是空
                KLineType:indexInfo.KLineType,  YSpecificMaxMin:indexInfo.YSpecificMaxMin,  YSplitScale:indexInfo.YSplitScale,
                FloatPrecision:indexInfo.FloatPrecision, Condition:indexInfo.Condition
            };
            
            return this.ChangeScriptIndex(windowIndex, indexData);
        }

        //主图指标
        if (indexItem.IsMainIndex)
        {
            if (windowIndex>0)  windowIndex=0;  //主图指标只能在主图显示
        }
        else
        {
            if (windowIndex==0) windowIndex=1;  //幅图指标,不能再主图显示
        }

        var paint=new Array();  //踢出当前窗口的指标画法
        for(var i in this.ChartPaint)
        {
            var item=this.ChartPaint[i];

            if (i==0 || item.ChartFrame!=this.Frame.SubFrame[windowIndex].Frame)
                paint.push(item);
        }

        
        this.Frame.SubFrame[windowIndex].Frame.YSpecificMaxMin=null;    //清空指定最大最小值
        this.Frame.SubFrame[windowIndex].Frame.IsLocked=false;          //解除上锁
        this.Frame.SubFrame[windowIndex].Frame.YSplitScale = null;      //清空固定刻度

        this.ChartPaint=paint;

        //清空东条标题
        var titleIndex=windowIndex+1;
        this.TitlePaint[titleIndex].Data=[];
        this.TitlePaint[titleIndex].Title=null;

        this.WindowIndex[windowIndex]=indexItem.Create();
        this.CreateWindowIndex(windowIndex);

        var bindData=this.ChartPaint[0].Data;
        this.BindIndexData(windowIndex,bindData);

        this.UpdataDataoffset();           //更新数据偏移
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Draw();
    }

    this.ChangePyScriptIndex=function(windowIndex,indexData)
    {
        this.DeleteIndexPaint(windowIndex);
        this.WindowIndex[windowIndex]=new PyScriptIndex(indexData.Name,indexData.Script,indexData.Args,indexData);    //脚本执行

        var bindData=this.ChartPaint[0].Data;
        this.BindIndexData(windowIndex,bindData);   //执行脚本

        this.UpdataDataoffset();           //更新数据偏移
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Draw();
    }

    this.ChangeKLineDrawType=function(drawType)
    {
        if (this.KLineDrawType==drawType) return;

        this.KLineDrawType=drawType;
        for(var i in this.ChartPaint)
        {
            var item=this.ChartPaint[i];
            if (i==0) item.DrawType=this.KLineDrawType;
            else if (item.ClassName=='ChartVolStick') item.KLineDrawType=this.KLineDrawType
        }

        if (this.OverlayChartPaint[0]) this.OverlayChartPaint[0].DrawType=this.KLineDrawType;   //叠加K线修改

        this.Draw();
    }

    //修改坐标类型
    this.ChangeCoordinateType=function(type)
    {
        if (!this.Frame && !this.Frame.SubFrame) return;
        if (!this.Frame.SubFrame.length) return;

        if (type==2) //反转坐标
        {
            this.Frame.SubFrame[0].Frame.CoordinateType=1;
        }
        else if(type==1)
        {
            this.Frame.SubFrame[0].Frame.YSplitOperator.CoordinateType=type;
        }
        else if (type==0)
        {
            this.Frame.SubFrame[0].Frame.CoordinateType=0;
            this.Frame.SubFrame[0].Frame.YSplitOperator.CoordinateType=0;
        }
        else
        {
            return;
        }

        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Frame.SetSizeChage(true);
        this.Draw();
    }

    //设置指标窗口个数
    this.ChangeIndexWindowCount=function(count)
    {
        if (count<=0) return;
        if (this.Frame.SubFrame.length==count) return;

        var currentLength=this.Frame.SubFrame.length;
        if (currentLength>count)
        {
            for(var i=currentLength-1;i>=count;--i)
            {
                this.DeleteIndexPaint(i);
                this.Frame.SubFrame[i].Frame.ClearToolbar();
            }

            this.Frame.SubFrame.splice(count,currentLength-count);
            this.WindowIndex.splice(count,currentLength-count);
        }
        else
        {
            //创建新的指标窗口
            for(var i=currentLength;i<count;++i)
            {
                var subFrame=this.CreateSubFrameItem(i);
                this.Frame.SubFrame[i]=subFrame;
                var titlePaint=new DynamicChartTitlePainting();
                titlePaint.Frame=this.Frame.SubFrame[i].Frame;
                titlePaint.Canvas=this.Canvas;
                this.TitlePaint[i+1]=titlePaint;
            }

            //创建指标
            const indexName=["RSI","MACD","VOL","UOS","CHO","BRAR"];
            let scriptData = new JSIndexScript();
            for(var i=currentLength;i<count;++i)
            {
                var name=indexName[i%indexName.length];
                let indexInfo = scriptData.Get(name);
                this.WindowIndex[i] = new ScriptIndex(indexInfo.Name, indexInfo.Script, indexInfo.Args,indexInfo);    //脚本执行
                var bindData=this.ChartPaint[0].Data;
                this.BindIndexData(i,bindData);   //执行脚本
            }

            //最后一个显示X轴坐标
            for(var i=0;i<this.Frame.SubFrame.length;++i)
            {
                var item=this.Frame.SubFrame[i].Frame;
                if (i==this.Frame.SubFrame.length-1) item.XSplitOperator.ShowText=true;
                else item.XSplitOperator.ShowText=false;
            }

            this.UpdataDataoffset();           //更新数据偏移
        }

        this.Frame.SetSizeChage(true);
        this.ResetFrameXYSplit();
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Draw();
    }

    this.RemoveIndexWindow=function(id)
    {
        console.log('[KLineChartContainer::RemoveIndexWindow] remove id', id);
        if (id==0) return;
        if (!this.Frame.SubFrame) return;
        if (id>=this.Frame.SubFrame.length) return;

        var delFrame=this.Frame.SubFrame[id].Frame;
        this.DeleteIndexPaint(id);
        this.Frame.SubFrame[id].Frame.ClearToolbar();
        this.Frame.SubFrame.splice(id,1);
        this.WindowIndex.splice(id,1);
        this.TitlePaint.splice(id+1,1); //删除对应的动态标题

        for(var i=0;i<this.Frame.SubFrame.length;++i)
        {
            var item=this.Frame.SubFrame[i].Frame;
            if (i==this.Frame.SubFrame.length-1) item.XSplitOperator.ShowText=true;
            else item.XSplitOperator.ShowText=false;

            item.Identify=i;
        }

        if (this.ChartDrawPicture.length>0)
        {
            var aryDrawPicture=[];
            for(var i in this.ChartDrawPicture)
            {
                var item=this.ChartDrawPicture[i];
                if (item.Frame==delFrame) continue;
                aryDrawPicture.push(item);
            }
            this.ChartDrawPicture=aryDrawPicture;
        }

        this.Frame.SetSizeChage(true);
        this.UpdateFrameMaxMin();
        this.ResetFrameXYSplit();
        this.Draw();
    }

    //获取当前的显示的指标
    this.GetIndexInfo=function()
    {
        var aryIndex=[];
        for(var i in this.WindowIndex)
        {
            var item=this.WindowIndex[i];
            var info={Name:item.Name};
            if (item.ID) info.ID=item.ID;
            aryIndex.push(info);
        }

        return aryIndex;
    }

    this.CreateExtendChart=function(name, option)   //创建扩展图形
    {
        var chart;
        switch(name)
        {
            case '筹码分布':
                chart=new StockChip();
                chart.Canvas=this.Canvas;
                chart.ChartBorder=this.Frame.ChartBorder;
                chart.ChartFrame=this.Frame;
                chart.HQChart=this;
                chart.SetOption(option);
                this.ExtendChartPaint.push(chart);
                return chart;
            case '画图工具':
                chart=new DrawToolsButton();
                chart.Canvas=this.Canvas;
                chart.ChartBorder=this.Frame.ChartBorder;
                chart.ChartFrame=this.Frame;
                chart.HQChart=this;
                chart.SetOption(option);
                this.ExtendChartPaint.push(chart);
                return chart;
            default:
                return null;
        }
    }

    this.GetExtendChartByClassName=function(name)
    {
        for(var i in this.ExtendChartPaint)
        {
            var item=this.ExtendChartPaint[i];
            if (item.ClassName==name) return { Index:i, Chart:item };
        }

        return null
    }

    this.DeleteExtendChart=function(data)
    {
        if (data.Index>=this.ExtendChartPaint.length) return;
        if (this.ExtendChartPaint[data.Index]!=data.Chart) return;

        if (typeof(data.Chart.Clear)=='function') data.Chart.Clear();
        this.ExtendChartPaint.splice(data.Index,1);
    }

    //锁|解锁指标 { Index:指标名字,IsLocked:是否要锁上,Callback:回调 }
    this.LockIndex=function(lockData)
    {
        if (!lockData) return;
        if (!lockData.IndexName) return;

        for(let i in this.WindowIndex)
        {
            let item=this.WindowIndex[i];
            if (!item) conintue;
            if (item.Name==lockData.IndexName)
            {
                item.SetLock(lockData);
                this.Update();
                break;
            }
        }
    }

    this.TryClickLock=function(x,y)
    {
        for(let i in this.Frame.SubFrame)
        {
            var item=this.Frame.SubFrame[i];
            if (!item.Frame.IsLocked) continue;
            if (!item.Frame.LockPaint) continue;

            var tooltip=new TooltipData();
            if (!item.Frame.LockPaint.GetTooltipData(x,y,tooltip)) continue;

            tooltip.HQChart=this;
            if (tooltip.Data.Callback) tooltip.Data.Callback(tooltip);
            return true;
        }

        return false;
    }

    this.SetSizeChage=function(bChanged)
    {
        this.Frame.SetSizeChage(bChanged);
        for(var i in this.ExtendChartPaint)
        {
            var item=this.ExtendChartPaint[i];
            item.SizeChange=bChanged;
        }
    }

    this.Update=function()
    {
        if (!this.SourceData) return;

        var bindData=new ChartData();
        bindData.Data=this.SourceData.Data;
        bindData.Period=this.Period;
        bindData.Right=this.Right;
        bindData.DataType=this.SourceData.DataType;

        if (bindData.Right>0 && bindData.Period<=3)    //复权(日线数据才复权)
        {
            var rightData=bindData.GetRightDate(bindData.Right);
            bindData.Data=rightData;
        }

        if (bindData.Period>0 && bindData.Period!=4)   //周期数据 (0= 日线,4=1分钟线 不需要处理)
        {
            var periodData=bindData.GetPeriodData(bindData.Period);
            bindData.Data=periodData;
        }

        //绑定数据
        this.BindMainData(bindData,this.PageSize);

        for(var i=0; i<this.Frame.SubFrame.length; ++i)
        {
            this.BindIndexData(i,bindData);
        }

        //叠加数据周期调整
        if (this.OverlayChartPaint[0].SourceData)
        {
            if(this.Period>=4)  //分钟不支持 清空掉
            {   
                this.OverlayChartPaint[0].Data=null;
            }
            else
            {   //日线叠加
                var bindData=new ChartData();
                bindData.Data=this.OverlayChartPaint[0].SourceData.Data;
                bindData.Period=this.Period;
                bindData.Right=this.Right;

                if (bindData.Right>0 && !IsIndexSymbol(this.OverlayChartPaint[0].Symbol))       //复权数据
                {
                    var rightData=bindData.GetRightDate(bindData.Right);
                    bindData.Data=rightData;
                }

                var aryOverlayData=this.SourceData.GetOverlayData(bindData.Data);      //和主图数据拟合以后的数据
                bindData.Data=aryOverlayData;

                if (bindData.Period>0)   //周期数据
                {
                    var periodData=bindData.GetPeriodData(bindData.Period);
                    bindData.Data=periodData;
                }

                this.OverlayChartPaint[0].Data=bindData;
            }
        }

        this.ReqeustKLineInfoData();
        
        //刷新画图
        this.UpdataDataoffset();           //更新数据偏移
        this.UpdatePointByCursorIndex();   //更新十字光标位子
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Frame.SetSizeChage(true);
        this.Draw();
    }

    //切换股票代码
    this.ChangeSymbol=function(symbol)
    {
        this.Symbol=symbol;
        if (IsIndexSymbol(symbol)) this.Right=0;    //指数没有复权

        if (this.Period<=3)
        {
            this.RequestHistoryData();                  //请求日线数据
            this.ReqeustKLineInfoData();
        }
        else 
        {
            this.ReqeustHistoryMinuteData();            //请求分钟数据
        }  
    }

    this.ReqeustKLineInfoData=function()
    {
        if (this.ChartPaint.length>0)
        {
            var klinePaint=this.ChartPaint[0];
            klinePaint.InfoData=new Map();
        }

        //信息地雷信息
        for(var i in this.ChartInfo)
        {
            this.ChartInfo[i].RequestData(this);
        }
    }

    //设置K线信息地雷
    this.SetKLineInfo=function(aryInfo,bUpdate)
    {
        this.ChartInfo=[];  //先清空
        for(var i in aryInfo)
        {
            var infoItem=JSKLineInfoMap.Get(aryInfo[i]);
            if (!infoItem) continue;
            var item=infoItem.Create();
            item.MaxReqeustDataCount=this.MaxReqeustDataCount;
            this.ChartInfo.push(item);
        }

        if (bUpdate==true) this.ReqeustKLineInfoData();
    }

    //添加信息地雷
    this.AddKLineInfo=function(infoName,bUpdate)
    {
        var classInfo=JSKLineInfoMap.GetClassInfo(infoName);
        if (!classInfo)
        {
            console.warn("[KLineChartContainer::AddKLineInfo] can't find infoname=", infoName);
            return;
        }

        for(var i in this.ChartInfo)
        {
            var item=this.ChartInfo[i];
            if (item.ClassName==classInfo.ClassName)    //已经存在
                return;
        }

        var infoItem=JSKLineInfoMap.Get(infoName);
        if (!infoItem) return;

        var item=infoItem.Create();
        item.MaxReqeustDataCount=this.MaxReqeustDataCount;
        this.ChartInfo.push(item);

        if (bUpdate==true) 
        {
            item.RequestData(this);  //信息地雷信息
        }
    }

    //删除信息地理
    this.DeleteKLineInfo=function(infoName)
    {
        var classInfo=JSKLineInfoMap.GetClassInfo(infoName);
        if (!classInfo)
        {
            console.warn("[KLineChartContainer::DeleteKLineInfo] can't find infoname=", infoName);
            return;
        }

        for(var i in this.ChartInfo)
        {
            var item=this.ChartInfo[i];
            if (item.ClassName==classInfo.ClassName)
            {
                this.ChartInfo.splice(i,1);
                this.UpdataChartInfo();
                this.Draw();
                break;
            }
        }
    }

    //清空所有的信息地理
    this.ClearKLineInfo=function()
    {
        if (!this.ChartInfo || this.ChartInfo.length<=0) return;

        this.ChartInfo=[];

        var klinePaint=this.ChartPaint[0];
        klinePaint.InfoData=null;
        this.Draw();
    }

    //叠加股票 只支持日线数据
    this.OverlaySymbol=function(symbol)
    {
        if (!this.OverlayChartPaint[0].MainData) return false;

        this.OverlayChartPaint[0].Symbol=symbol;

        if (this.Period<=3) this.RequestOverlayHistoryData();                  //请求日线数据
        
        return true;
    }

    this.RequestOverlayHistoryData=function()
    {
        if (!this.OverlayChartPaint.length) return;

        var symbol=this.OverlayChartPaint[0].Symbol;
        if (!symbol) return;

        var self = this;

         //请求数据
         $.ajax({
            url: this.KLineApiUrl,
            data:
            {
                "field": [
                    "name",
                    "symbol",
                    "yclose",
                    "open",
                    "price",
                    "high"
                ],
                "symbol": symbol,
                "start": -1,
                "count": this.MaxReqeustDataCount
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (data)
            {
                self.RecvOverlayHistoryData(data);
            }
        });
    }

    this.RecvOverlayHistoryData=function(data)
    {
        var aryDayData=KLineChartContainer.JsonDataToHistoryData(data);

        //原始叠加数据
        var sourceData=new ChartData();
        sourceData.Data=aryDayData;
        sourceData.DataType=0;

        var bindData=new ChartData();
        bindData.Data=aryDayData;
        bindData.Period=this.Period;
        bindData.Right=this.Right;
        bindData.DataType=0;

        if (bindData.Right>0 && !IsIndexSymbol(data.symbol))    //复权数据 ,指数没有复权)
        {
            var rightData=bindData.GetRightDate(bindData.Right);
            bindData.Data=rightData;
        }

        var aryOverlayData=this.SourceData.GetOverlayData(bindData.Data);      //和主图数据拟合以后的数据
        bindData.Data=aryOverlayData;

        if (bindData.Period>0)   //周期数据
        {
            var periodData=bindData.GetPeriodData(bindData.Period);
            bindData.Data=periodData;
        }

        this.OverlayChartPaint[0].Data=bindData;
        this.OverlayChartPaint[0].SourceData=sourceData;
        this.OverlayChartPaint[0].Title=data.name;
        this.OverlayChartPaint[0].Symbol=data.symbol;

        this.Frame.SubFrame[0].Frame.YSplitOperator.CoordinateType=1; //调整为百份比坐标

        this.UpdataDataoffset();           //更新数据偏移
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Frame.SetSizeChage(true);
        this.Draw();

    }

    //取消叠加股票
    this.ClearOverlaySymbol=function()
    {
        this.OverlayChartPaint[0].Symbol=null;
        this.OverlayChartPaint[0].Data=null;
        this.OverlayChartPaint[0].SourceData=null;
        this.OverlayChartPaint[0].TooltipRect=[];
        this.Frame.SubFrame[0].Frame.YSplitOperator.CoordinateType=0; //调整一般坐标
        this.UpdateFrameMaxMin();
        this.Draw();
    }

    this.RequestFlowCapitalData=function()
    {
        if (!this.Symbol) return;
        if (this.FlowCapitalReady==true) return;

        var self = this;
        let fieldList=["name","date","symbol","capital.a"];
        //请求数据
        $.ajax({
            url: this.StockHistoryDayApiUrl,
            data:
            {
                "field": fieldList,
                "symbol": [this.Symbol],
                "orderfield":"date"
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (recvData)
            {
                self.RecvFlowCapitalData(recvData);
            }
        });
    }

    this.RecvFlowCapitalData=function(data)
    {
        if (!data.stock || data.stock.length!=1) return;

        let stock=data.stock[0];
        var aryData=new Array();
        for(let i in stock.stockday)
        {
            var item=stock.stockday[i];
            let indexData=new SingleData();
            indexData.Date=item.date;
            var financeData=item.capital;
            if (!financeData) continue;
            if (financeData.a>0)
            {
                indexData.Value=financeData.a;    //流通股本（股）
                aryData.push(indexData);
            }
        }

        if (this.Period>=4) //分钟数据
        {
            var aryFixedData=this.SourceData.GetMinuteFittingFinanceData(aryData);
            for(let i in this.SourceData.Data)
            {
                var item=this.SourceData.Data[i];
                item.FlowCapital=aryFixedData[i].Value;
            }

            var bindData=this.ChartPaint[0].Data;
            var newBindData=new ChartData();
            newBindData.Data=this.SourceData.Data;

            if (bindData.Period>4) //周期数据
            {
                var periodData=newBindData.GetPeriodData(bindData.Period);  
                newBindData.Data=periodData;
            }
            bindData.Data=newBindData.Data;
        }
        else
        {
            var aryFixedData=this.SourceData.GetFittingFinanceData(aryData);
            for(let i in this.SourceData.Data)
            {
                var item=this.SourceData.Data[i];
                item.FlowCapital=aryFixedData[i].Value;
            }

            var bindData=this.ChartPaint[0].Data;
            var newBindData=new ChartData();
            newBindData.Data=this.SourceData.Data;

            if (bindData.Right>0)    //复权
            {
                var rightData=newBindData.GetRightDate(bindData.Right);
                newBindData.Data=rightData;
            }

            if (bindData.Period>0) //周期数据
            {
                var periodData=newBindData.GetPeriodData(bindData.Period);  
                newBindData.Data=periodData;
            }

            bindData.Data=newBindData.Data;
        }

        this.FlowCapitalReady=true;
        var bDraw=false;
        for(var i in this.ExtendChartPaint)
        {
            var item=this.ExtendChartPaint[i];
            if (item.ClassName=='StockChip')
            {
                bDraw=true;
                break;
            }
        }

        if (bDraw) this.Draw();
    }

    //创建画图工具
    this.CreateChartDrawPicture=function(name)
    {
        var drawPicture=null;
        switch(name)
        {
            case "线段":
                drawPicture=new ChartDrawPictureLine();
                break;
            case "射线":
                drawPicture=new ChartDrawPictureHaflLine();
                break;
            case '水平线':
                drawPicture=new ChartDrawPictureHorizontalLine();
                break;
            case '趋势线':
                drawPicture=new ChartDrawPictureTrendLine();
                break;
            case "矩形":
                drawPicture=new ChartDrawPictureRect();
                break;
            case "圆弧线":
                drawPicture=new ChartDrawPictureArc();
                break;
            case 'M头W底':
                drawPicture=new ChartDrawPictureWaveMW();
                break;
            case '平行线':
                drawPicture=new ChartDrawPictureParallelLines();
                break;
            case '平行通道':
                drawPicture=new ChartDrawPictureParallelChannel();
                break;
            case '价格通道线':
                drawPicture=new ChartDrawPicturePriceChannel();
                break;
            case '文本':
                drawPicture=new ChartDrawPictureText();
                break;
            case '江恩角度线':
                drawPicture=new ChartDrawPictureGannFan();
                break;
            case '阻速线':
                drawPicture=new ChartDrawPictureResistanceLine()
                break;
            case '黄金分割':
                drawPicture=new ChartDrawPictureGoldenSection()
                break;
            case '百分比线':
                drawPicture=new ChartDrawPicturePercentage();
                break;
            case '波段线':
                drawPicture=new ChartDrawPictureWaveBand();
                break;
            case '三角形':
                drawPicture=new ChartDrawPictureTriangle();
                break;
            case '对称角度':
                drawPicture=new ChartDrawPictureSymmetryAngle();
                break;
            case '圆':
                drawPicture=new ChartDrawPictureCircle();
                break;
            case '平行四边形':
                drawPicture=new ChartDrawPictureQuadrangle();
                break;
            case '斐波那契周期线':
                drawPicture=new ChartDrawPictureFibonacci();
                break;
            default:
                {
                    //iconfont 图标
                    const ICONFONT_LIST=new Map(
                        [
                            ["icon-arrow_up", { Text:'\ue683', Color:'#318757'}],
                            ["icon-arrow_down", { Text:'\ue681', Color:'#db563e'}],
                            ["icon-arrow_right", { Text:'\ue680', Color:'#318757'}],
                            ["icon-arrow_left", { Text:'\ue682', Color:'#318757'}],
                        ]
                    );

                    if (ICONFONT_LIST.has(name))
                    {
                        var item=ICONFONT_LIST.get(name);
                        drawPicture=new ChartDrawPictureIconFont();
                        drawPicture.FontOption.Family='iconfont';
                        drawPicture.Text=item.Text;
                        if (item.Color) drawPicture.LineColor=item.Color;
                        break;
                    }
                }
                return false;
        }

        drawPicture.Canvas=this.Canvas;
        drawPicture.Status=0;
        self=this;
        drawPicture.Update=function()   //更新回调函数
        {
            self.DrawDynamicInfo();
        };
        this.CurrentChartDrawPicture=drawPicture;
        return true;
    }

    this.SetChartDrawPictureFirstPoint=function(x,y)
    {
        var drawPicture=this.CurrentChartDrawPicture;
        if (!drawPicture) return false;
        if (!this.Frame.SubFrame || this.Frame.SubFrame.length<=0) return false;

        for(var i in this.Frame.SubFrame)
        {
            var frame=this.Frame.SubFrame[i].Frame;
            var left=frame.ChartBorder.GetLeft();
            var top=frame.ChartBorder.GetTopEx();
            var height=frame.ChartBorder.GetHeight();
            var width=frame.ChartBorder.GetWidth();

            this.Canvas.beginPath();
            this.Canvas.rect(left,top,width,height);
            if (this.Canvas.isPointInPath(x,y))
            {
                drawPicture.Frame=frame;
                break;
            }
        }

        if (!drawPicture.Frame) return false;

        drawPicture.Point[0]=new Point();
        drawPicture.Point[0].X=x-this.UIElement.getBoundingClientRect().left;
        drawPicture.Point[0].Y=y-this.UIElement.getBoundingClientRect().top;
        drawPicture.Status=1;   //第1个点完成
    }

    this.SetChartDrawPictureSecondPoint=function(x,y)
    {
        var drawPicture=this.CurrentChartDrawPicture;
        if (!drawPicture) return false;

        drawPicture.Point[1]=new Point();
        drawPicture.Point[1].X=x-this.UIElement.getBoundingClientRect().left;
        drawPicture.Point[1].Y=y-this.UIElement.getBoundingClientRect().top;

        drawPicture.Status=2;   //设置第2个点
    }

    //设置第3个点
    this.SetChartDrawPictureThirdPoint=function(x,y)
    {
        var drawPicture=this.CurrentChartDrawPicture;
        if (!drawPicture) return false;

        drawPicture.Point[2]=new Point();
        drawPicture.Point[2].X=x-this.UIElement.getBoundingClientRect().left;
        drawPicture.Point[2].Y=y-this.UIElement.getBoundingClientRect().top;

        drawPicture.Status=3;   //设置第2个点
    }

    //xStep,yStep 移动的偏移量
    this.MoveChartDrawPicture=function(xStep,yStep)
    {
        var drawPicture=this.CurrentChartDrawPicture;
        if (!drawPicture) return false;

        //console.log("xStep="+xStep+" yStep="+yStep);
        drawPicture.Move(xStep,yStep);

        return true;
    }

    this.FinishChartDrawPicturePoint=function()
    {
        var drawPicture=this.CurrentChartDrawPicture;
        if (!drawPicture) return false;
        if (drawPicture.PointCount!=drawPicture.Point.length) return false;

        drawPicture.Status=10;  //完成
        drawPicture.PointToValue();

        this.ChartDrawPicture.push(drawPicture);
        this.CurrentChartDrawPicture=null;

        return true;
    }


    //注册鼠标右键事件
    this.OnRightMenu=function(x,y,e)
    {
        if (this.RightMenu)
        {
            var frameId=this.Frame.PtInFrame(x,y);
            e.data={ Chart:this, FrameID:frameId };
            this.RightMenu.DoModal(e);
        }
    }



    this.FinishMoveChartDrawPicture=function()
    {
        var drawPicture=this.CurrentChartDrawPicture;
        if (!drawPicture) return false;
        if (drawPicture.PointCount!=drawPicture.Point.length) return false;

        drawPicture.Status=10;  //完成
        drawPicture.PointToValue();

        this.CurrentChartDrawPicture=null;
        return true;
    }

    //清空所有的画线工具
    this.ClearChartDrawPicture=function(drawPicture)
    {
        if (!drawPicture)
        {
            this.ChartDrawPicture=[];
            this.Draw();
        }
        else
        {
            for(var i in this.ChartDrawPicture)
            {
                if (this.ChartDrawPicture[i]==drawPicture)
                {
                    this.ChartDrawPicture.splice(i,1);
                    this.Draw();
                }
            }
        }
    }

    //选中画图工具事件
    this.OnSelectChartPicture=function(chart)
    {
        
    }

    //形态匹配
    // scope.Plate 板块范围 scope.Symbol 股票范围
    // sample 样本数据
    this.RequestKLineMatch=function(sample,scope)
    {
        var self =this;
        console.log('[KLineChartContainer::RequestKLineMatch',sample,scope)

        var aryDate=new Array();
        var aryValue=new Array();

        for(var i=sample.Start;i<sample.End && i<sample.Data.Data.length;++i)
        {
            var item=sample.Data.Data[i];
            aryDate.push(item.Date);
            aryValue.push(item.Close);
        }

        var sampleData=
        {
            Stock:sample.Stock,
            Index:{Start:sample.Start, End:sample.End}, //数据索引
            Date:{Start:aryDate[0], End:aryDate[aryDate.length-1]}, //起始 结束日期
            Minsimilar:scope.Minsimilar,    //相似度
            Plate:scope.Plate,
            DayRegion:300
        };

        //请求数据
        $.ajax({
            url: this.KLineMatchUrl,
            data:
            {
                "userid": "guest",
                "plate": scope.Plate,
                "period": this.Period,
                "right": this.Right,
                "dayregion": sampleData.DayRegion,
                "minsimilar": scope.Minsimilar,
                "sampledate":aryDate,
                "samplevalue":aryValue
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (data)
            {
                self.RecvKLineMatchData(data,sampleData);
            },
            error:function(jqXHR, textStatus, errorThrown)
            {
                console.warn('[KLineChartContainer::RequestKLineMatch] failed',jqXHR,textStatus, errorThrown);
            }
        });
    }

    //接收形态选股结果
    this.RecvKLineMatchData=function(data,sample)
    {
        console.log('[KLineChartContainer::RecvKLineMatchData] recv',data,sample);
        var filterData=[]; //结果数据
        for(var i in data.match)
        {
            var item=data.match[i];
            if (item.symbol==sample.Stock.Symbol) continue;

            for(var j in item.data)
            {
                var dataItem=item.data[j];
                var newItem={Symbol:item.symbol, Name:item.name,Similar:dataItem.similar, Start:dataItem.start, End:dataItem.end};
                filterData.push(newItem);
            }
        }
        filterData.sort(function(a,b){return b.Similar-a.Similar;});    //排序
        console.log('[KLineChartContainer::RecvKLineMatchData] filterData',filterData);

        if (this.mapEvent.has(JSCHART_EVENT_ID.RECV_KLINE_MATCH))
        {
            var item=this.mapEvent.get(JSCHART_EVENT_ID.RECV_KLINE_MATCH);
            var data={Sample:sample, Match:filterData, Source:data}
            item.Callback(item,data,this);
        }
        else
        {
            var dlg=new KLineMatchDialog(this.Frame.ChartBorder.UIElement.parentNode);

            var event={ data:{ Chart:this, MatchData:filterData, Sample:sample, Source:data} };
            dlg.DoModal(event);
        } 
    }

    //更新信息地雷
    this.UpdataChartInfo=function()
    {
        //TODO: 根据K线数据日期来做map, 不在K线上的合并到下一个k线日期里面
        var mapInfoData=null;
        if (this.Period==0) //日线数据 根据日期
        {
            mapInfoData=new Map();
            for(var i in this.ChartInfo)
            {
                var infoData=this.ChartInfo[i].Data;
                for(var j in infoData)
                {
                    var item=infoData[j];
                    if (mapInfoData.has(item.Date.toString()))
                    {
                        mapInfoData.get(item.Date.toString()).Data.push(item);
                    }
                    else
                    {

                        mapInfoData.set(item.Date.toString(),{Data:new Array(item)});
                    }
                }
            }
        }
        else if ( this.Period==1 || this.Period==2 || this.Period==3)
        {
            mapInfoData=new Map();
            var hisData=this.ChartPaint[0].Data;
            //增加一个临时数据索引
            for(var i in this.ChartInfo)
            {
                this.ChartInfo[i].TempID=this.ChartInfo[i].Data.length-1;   
            }

            for(var i=0;i<hisData.Data.length;++i)
            {
                var kItem=hisData.Data[i];  //K线数据
                for(var j in this.ChartInfo)
                {
                    var info=this.ChartInfo[j];
                    var infoData=info.Data;
                    for(; info.TempID>=0; --info.TempID)    //信息地雷是倒叙排的
                    {
                        var infoItem=infoData[info.TempID];
                        if (infoItem.Date>kItem.Date) break;
                        
                        //信息地雷日期<K线上的日期 就是属于这个K线上的
                        if (mapInfoData.has(kItem.Date.toString()))
                        {
                            mapInfoData.get(kItem.Date.toString()).Data.push(infoItem);
                        }
                        else
                        {
                            mapInfoData.set(kItem.Date.toString(),{Data:new Array(infoItem)});
                        }
                    }
                }
                //console.log('[KLineChartContainer::UpdataChartInfo]',item);
            }

            //清空临时变量
            for(var i in this.ChartInfo)
            {
                delete this.ChartInfo[i].TempID;
            }
        }
            
        var klinePaint=this.ChartPaint[0];
        klinePaint.InfoData=mapInfoData;
    }

    //更新窗口指标
    this.UpdateWindowIndex=function(index)
    {
        var bindData=new ChartData();
        bindData.Data=this.SourceData.Data;
        bindData.Period=this.Period;
        bindData.Right=this.Right;

        if (bindData.Right>0)    //复权
        {
            var rightData=bindData.GetRightDate(bindData.Right);
            bindData.Data=rightData;
        }

        if (bindData.Period>0)   //周期数据
        {
            var periodData=bindData.GetPeriodData(bindData.Period);
            bindData.Data=periodData;
        }

        if (typeof(this.WindowIndex[index].ExecuteScript)=='function')
        {
            var hisData=this.ChartPaint[0].Data;
            this.WindowIndex[index].ExecuteScript(this,index,hisData);
        }
        else
        {
            this.WindowIndex[index].BindData(this,index,bindData);
        }

        this.UpdataDataoffset();           //更新数据偏移
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Draw();
    }

    //修改参数指标
    this.ChangeWindowIndexParam=function(index)
    {
        this.WindowIndex[index].Index[0].Param+=1;
        this.WindowIndex[index].Index[1].Param+=1;

        this.UpdateWindowIndex(index);
    }


    this.OnDoubleClick=function(x,y,e)
    {
        if (!this.MinuteDialog) return;

        var tooltip=new TooltipData();
        for(var i in this.ChartPaint)
        {
            var item=this.ChartPaint[i];
            if (item.GetTooltipData(x,y,tooltip))
            {
                break;
            }
        }

        if (!tooltip.Data) return;

        e.data={Chart:this,Tooltip:tooltip};

        this.MinuteDialog.DoModal(e);
    }

    //选中画图工具 出现单个图形设置菜单
    this.OnSelectChartPicture=function(chart)
    {   
        console.log('[KLineChartContainer::OnSelectChartPicture',chart);
        if (!this.ChartPictureMenu) this.ChartPictureMenu=new ChartPictureSettingMenu(this.UIElement.parentNode);

        var event={ data: { ChartPicture:chart, HQChart:this}};
        this.ChartPictureMenu.DoModal(event);
    }

    //this.RecvKLineMatchData=function(data)
    //{
    //    console.log(data);
    //}

    //数据自动更新
    this.AutoUpdate=function()
    {
        if (!this.IsAutoUpdate) return;
        var self = this;

        //9:30 - 15:40 非周6，日 每隔30秒更新一次 this.RequestMinuteData();
        var nowDate= new Date(),
            day = nowDate.getDay(),
            time = nowDate.getHours() * 100 + nowDate.getMinutes();

        if(day == 6 || day== 0) return ;

        if(time>1540) return ;

        var frequency=this.AutoUpdateFrequency;
        if(time <930)
        {
            setTimeout(function()
            {
                self.AutoUpdate();
            },frequency);

        }else
        {
            setTimeout(function()
            {
                if (self.Period<=3)
                {
                    self.ReqeustRealtimeData();                  //更新最新行情
                    //self.ReqeustKLineInfoData();
                }
                else 
                {
                    self.ReqeustHistoryMinuteData();            //请求分钟数据
                }  
            },frequency);
        }
    }

}

//API 返回数据 转化为array[]
KLineChartContainer.JsonDataToHistoryData=function(data)
{
    var list = data.data;
    var aryDayData=new Array();
    var date = 0, yclose = 1, open = 2, high = 3, low = 4, close = 5, vol = 6, amount = 7;
    for (var i = 0; i < list.length; ++i)
    {
        var item = new HistoryData();

        item.Date = list[i][date];
        item.Open = list[i][open];
        item.YClose = list[i][yclose];
        item.Close = list[i][close];
        item.High = list[i][high];
        item.Low = list[i][low];
        item.Vol = list[i][vol];    //原始单位股
        item.Amount = list[i][amount];

        if (isNaN(item.Open) || item.Open<=0) continue; //停牌的数据剔除

        aryDayData.push(item);
    }

    return aryDayData;
}

KLineChartContainer.JsonDataToRealtimeData=function(data)
{
    var item=new HistoryData();
    item.Date=data.stock[0].date;
    item.Open=data.stock[0].open;
    item.YClose=data.stock[0].yclose;
    item.High=data.stock[0].high;
    item.Low=data.stock[0].low;
    item.Vol=data.stock[0].vol/100; //原始单位股
    item.Amount=data.stock[0].amount;
}

//API 返回数据 转化为array[]
KLineChartContainer.JsonDataToMinuteHistoryData=function(data)
{
    var list = data.data;
    var aryDayData=new Array();
    var date = 0, yclose = 1, open = 2, high = 3, low = 4, close = 5, vol = 6, amount = 7, time = 8;
    for (var i = 0; i < list.length; ++i)
    {
        var item = new HistoryData();

        item.Date = list[i][date];
        item.Open = list[i][open];
        item.YClose = list[i][yclose];
        item.Close = list[i][close];
        item.High = list[i][high];
        item.Low = list[i][low];
        item.Vol = list[i][vol]/100;    //原始单位股
        item.Amount = list[i][amount];
        item.Time=list[i][time];

       // if (isNaN(item.Open) || item.Open<=0) continue; //停牌的数据剔除

        aryDayData.push(item);
    }
    // 无效数据处理
    for(var i = 0; i < aryDayData.length; ++i)
    {
        var minData = aryDayData[i];
        if (minData == null) coninue;
        if (isNaN(minData.Open) || minData.Open <= 0 || isNaN(minData.High) || minData.High <= 0 || isNaN(minData.Low) || minData.Low <= 0 
            || isNaN(minData.Close) || minData.Close <= 0 || isNaN(minData.YClose) || minData.YClose <= 0)
        {
            if (i == 0)
            {
                if (minData.YClose > 0)
                {
                    minData.Open = minData.YClose;
                    minData.High = minData.YClose;
                    minData.Low = minData.YClose;
                    minData.Close = minData.YClose;
                }
            }
            else // 用前一个有效数据填充
            {
                for(var j = i-1; j >= 0; --j)
                {
                    var minData2 = aryDayData[j];
                    if (minData2 == null) coninue;
                    if (minData2.Open > 0 && minData2.High > 0 && minData2.Low > 0 && minData2.Close > 0)
                    {
                        if (minData.YClose <= 0) minData.YClose = minData2.Close;
                        minData.Open = minData2.Open;
                        minData.High = minData2.High;
                        minData.Low = minData2.Low;
                        minData.Close = minData2.Close;
                        break;
                    }
                }
            }    
        }
    }
    return aryDayData;
}


///////////////////////////////////////////////////////////////////////////////////////////
//  走势图
//
function MinuteChartContainer(uielement)
{
    this.newMethod=JSChartContainer;   //派生
    this.newMethod(uielement);
    delete this.newMethod;

    this.ClassName='MinuteChartContainer';
    this.WindowIndex=new Array();
    this.Symbol;
    this.Name;
    this.SourceData;                          //原始的历史数据
    this.OverlaySourceData;                   //叠加的原始数据
    this.IsAutoUpdate=true;                   //是否自动更新行情数据
    this.AutoUpdateFrequency=30000;             //30秒更新一次数据
    this.TradeDate=0;                         //行情交易日期
    this.DayCount=1;                          //显示几天的数据
    this.DayData;                             //多日分钟数据

    this.MinuteApiUrl=g_JSChartResource.Domain+"/API/Stock";
    this.HistoryMinuteApiUrl=g_JSChartResource.Domain+'/API/StockMinuteData';  //历史分钟数据

    //手机拖拽
    uielement.ontouchstart=function(e)
    {
        if(!this.JSChartContainer) return;
        if(this.JSChartContainer.DragMode==0) return;

        this.JSChartContainer.PhonePinch=null;

        e.preventDefault();
        var jsChart=this.JSChartContainer;

        if (jsChart.IsPhoneDragging(e))
        {
            var drag=
            {
                "Click":{},
                "LastMove":{},  //最后移动的位置
            };

            var touches=jsChart.GetToucheData(e,jsChart.IsForceLandscape);

            drag.Click.X=touches[0].clientX;
            drag.Click.Y=touches[0].clientY;
            drag.LastMove.X=touches[0].clientX;
            drag.LastMove.Y=touches[0].clientY;

            document.JSChartContainer=this.JSChartContainer;
            this.JSChartContainer.SelectChartDrawPicture=null;
            if (jsChart.ChartCorssCursor.IsShow === true)    //移动十字光标
            {
                var pixelTatio = GetDevicePixelRatio();
                var x = drag.Click.X-this.getBoundingClientRect().left*pixelTatio;
                var y = drag.Click.Y-this.getBoundingClientRect().top*pixelTatio;
                jsChart.OnMouseMove(x, y, e);
            }
        }

        uielement.ontouchmove=function(e)
        {
            if(!this.JSChartContainer) return;
            e.preventDefault();

            var touches=jsChart.GetToucheData(e,this.JSChartContainer.IsForceLandscape);
            if (jsChart.IsPhoneDragging(e))
            {
                var drag=this.JSChartContainer.MouseDrag;
                if (drag==null)
                {
                    var pixelTatio = GetDevicePixelRatio();
                    var x = touches[0].clientX-this.getBoundingClientRect().left*pixelTatio;
                    var y = touches[0].clientY-this.getBoundingClientRect().top*pixelTatio;
                    this.JSChartContainer.OnMouseMove(x,y,e);
                }
            }
        };

        uielement.ontouchend=function(e)
        {
            clearTimeout(timeout);
        }

    }

    //键盘左右移动十字光标
    this.OnKeyDown=function(e)
    {
        var keyID = e.keyCode ? e.keyCode :e.which;
        switch(keyID)
        {
            case 37: //left
                this.CursorIndex=parseInt(this.CursorIndex);
                if (this.CursorIndex<=0.99999)
                {
                    if (!this.DataMoveLeft()) break;
                    this.UpdataDataoffset();
                    this.UpdatePointByCursorIndex();
                    this.UpdateFrameMaxMin();
                    this.Draw();
                }
                else
                {
                    --this.CursorIndex;
                    this.UpdatePointByCursorIndex();
                    this.DrawDynamicInfo();
                }
                break;
            case 39: //right
                var xPointcount=0;
                if (this.Frame.XPointCount) xPointcount=this.Frame.XPointCount;
                else xPointcount=this.Frame.SubFrame[0].Frame.XPointCount;
                this.CursorIndex=parseInt(this.CursorIndex);
                if (this.CursorIndex+1>=xPointcount)
                {
                    if (!this.DataMoveRight()) break;
                    this.UpdataDataoffset();
                    this.UpdatePointByCursorIndex();
                    this.UpdateFrameMaxMin();
                    this.Draw();
                }
                else
                {
                    //判断是否在最后一个数据上
                    var data=null;
                    if (this.Frame.Data) data=this.Frame.Data;
                    else data=this.Frame.SubFrame[0].Frame.Data;
                    if (!data) break;
                    if (this.CursorIndex+data.DataOffset+1>=data.Data.length) break;

                    ++this.CursorIndex;
                    this.UpdatePointByCursorIndex();
                    this.DrawDynamicInfo();
                }
                break;
            default:
                return;
        }

        //不让滚动条滚动
        if(e.preventDefault) e.preventDefault();
        else e.returnValue = false;
    }

    //注册鼠标右键事件
    this.OnRightMenu=function(x,y,e)
    {
        if (this.RightMenu)
        {
            var frameId=this.Frame.PtInFrame(x,y);
            e.data={ Chart:this, FrameID:frameId };
            this.RightMenu.DoModal(e);
        }
    }

    this.UpdatePointByCursorIndex=function()
    {
        this.LastPoint.X=this.Frame.GetXFromIndex(this.CursorIndex);

        var index=this.CursorIndex;
        index=parseInt(index.toFixed(0));
        var data=this.Frame.Data;
        if (data.DataOffset+index>=data.Data.length)
        {
            return;
        }
        var close=data.Data[data.DataOffset+index];

        this.LastPoint.Y=this.Frame.GetYFromData(close);
    }



    //创建
    //windowCount 窗口个数
    this.Create=function(windowCount)
    {
        this.UIElement.JSChartContainer=this;

        //创建十字光标
        this.ChartCorssCursor=new ChartCorssCursor();
        this.ChartCorssCursor.Canvas=this.Canvas;
        this.ChartCorssCursor.StringFormatX=new HQMinuteTimeStringFormat();
        this.ChartCorssCursor.StringFormatY=new HQPriceStringFormat();

        //创建框架容器
        this.Frame=new HQTradeFrame();
        this.Frame.ChartBorder=new ChartBorder();
        this.Frame.ChartBorder.UIElement=this.UIElement;
        this.Frame.ChartBorder.Top=25;
        this.Frame.ChartBorder.Left=50;
        this.Frame.ChartBorder.Bottom=20;
        this.Frame.Canvas=this.Canvas;
        this.ChartCorssCursor.Frame=this.Frame; //十字光标绑定框架

        this.CreateChildWindow(windowCount);
        this.CreateMainKLine();

        //子窗口动态标题
        for(var i in this.Frame.SubFrame)
        {
            var titlePaint=new DynamicChartTitlePainting();
            titlePaint.Frame=this.Frame.SubFrame[i].Frame;
            titlePaint.Canvas=this.Canvas;

            this.TitlePaint.push(titlePaint);
        }

        this.ChartCorssCursor.StringFormatX.Frame=this.Frame.SubFrame[0].Frame;

        this.UIElement.addEventListener("keydown", OnKeyDown, true);    //键盘消息
    }

    //创建子窗口
    this.CreateChildWindow=function(windowCount)
    {
        for(var i=0;i<windowCount;++i)
        {
            var border=new ChartBorder();
            border.UIElement=this.UIElement;

            var frame=new MinuteFrame();
            frame.Canvas=this.Canvas;
            frame.ChartBorder=border;
            if (i<2) frame.ChartBorder.TitleHeight=0;
            frame.XPointCount=243;

            var DEFAULT_HORIZONTAL=[9,8,7,6,5,4,3,2,1];
            frame.HorizontalMax=DEFAULT_HORIZONTAL[0];
            frame.HorizontalMin=DEFAULT_HORIZONTAL[DEFAULT_HORIZONTAL.length-1];

            if (i==0)
            {
                frame.YSplitOperator=new FrameSplitMinutePriceY();
                frame.YSplitOperator.FrameSplitData=this.FrameSplitData.get('price');
            }
            else
            {
                frame.YSplitOperator=new FrameSplitY();
                frame.YSplitOperator.FrameSplitData=this.FrameSplitData.get('double');
            }

            frame.YSplitOperator.Frame=frame;
            frame.YSplitOperator.ChartBorder=border;
            frame.XSplitOperator=new FrameSplitMinuteX();
            frame.XSplitOperator.Frame=frame;
            frame.XSplitOperator.ChartBorder=border;
            if (i!=windowCount-1) frame.XSplitOperator.ShowText=false;
            frame.XSplitOperator.Operator();

            for(var j in DEFAULT_HORIZONTAL)
            {
                frame.HorizontalInfo[j]= new CoordinateInfo();
                frame.HorizontalInfo[j].Value=DEFAULT_HORIZONTAL[j];
                if (i==0 && j==frame.HorizontalMin) continue;

                frame.HorizontalInfo[j].Message[1]=DEFAULT_HORIZONTAL[j].toString();
                frame.HorizontalInfo[j].Font="14px 微软雅黑";
            }

            var subFrame=new SubFrameItem();
            subFrame.Frame=frame;
            if (i==0)
                subFrame.Height=20;
            else
                subFrame.Height=10;

            this.Frame.SubFrame[i]=subFrame;
        }
    }

    //删除某一个窗口的指标
    this.DeleteIndexPaint=function(windowIndex)
    {
        let paint=new Array();          //踢出当前窗口的指标画法
        for(let i in this.ChartPaint)
        {
            let item=this.ChartPaint[i];

            if (i==0 || item.ChartFrame!=this.Frame.SubFrame[windowIndex].Frame)
                paint.push(item);
        }

        //清空指定最大最小值
        this.Frame.SubFrame[windowIndex].Frame.YSpecificMaxMin=null;
        this.Frame.SubFrame[windowIndex].Frame.IsLocked=false;          //解除上锁

        this.ChartPaint=paint;

         //清空东条标题
         var titleIndex=windowIndex+1;
         this.TitlePaint[titleIndex].Data=[];
         this.TitlePaint[titleIndex].Title=null;
    }

    this.CreateStockInfo=function()
    {
        this.ExtendChartPaint[0]=new StockInfoExtendChartPaint();
        this.ExtendChartPaint[0].Canvas=this.Canvas;
        this.ExtendChartPaint[0].ChartBorder=this.Frame.ChartBorder;
        this.ExtendChartPaint[0].ChartFrame=this.Frame;

        this.Frame.ChartBorder.Right=300;
    }

    //创建主图K线画法
    this.CreateMainKLine=function()
    {
        //分钟线
        var minuteLine=new ChartMinutePriceLine();
        minuteLine.Canvas=this.Canvas;
        minuteLine.ChartBorder=this.Frame.SubFrame[0].Frame.ChartBorder;
        minuteLine.ChartFrame=this.Frame.SubFrame[0].Frame;
        minuteLine.Name="Minute-Line";
        minuteLine.Color=g_JSChartResource.Minute.PriceColor;
        minuteLine.AreaColor=g_JSChartResource.Minute.AreaPriceColor;

        this.ChartPaint[0]=minuteLine;

        //分钟线均线
        var averageLine=new ChartMinutePriceLine();
        averageLine.Canvas=this.Canvas;
        averageLine.ChartBorder=this.Frame.SubFrame[0].Frame.ChartBorder;
        averageLine.ChartFrame=this.Frame.SubFrame[0].Frame;
        averageLine.Name="Minute-Average-Line";
        averageLine.Color=g_JSChartResource.Minute.AvPriceColor;
        averageLine.IsDrawArea=false;
        this.ChartPaint[1]=averageLine;

        var averageLine=new ChartMinuteVolumBar();
        averageLine.Color=g_JSChartResource.Minute.VolBarColor;
        averageLine.Canvas=this.Canvas;
        averageLine.ChartBorder=this.Frame.SubFrame[1].Frame.ChartBorder;
        averageLine.ChartFrame=this.Frame.SubFrame[1].Frame;
        averageLine.Name="Minute-Vol-Bar";
        this.ChartPaint[2]=averageLine;


        this.TitlePaint[0]=new DynamicMinuteTitlePainting();
        this.TitlePaint[0].Frame=this.Frame.SubFrame[0].Frame;
        this.TitlePaint[0].Canvas=this.Canvas;
        this.TitlePaint[0].OverlayChartPaint=this.OverlayChartPaint;    //绑定叠加

        
        //主图叠加画法
        var paint=new ChartOverlayMinutePriceLine();
        paint.Canvas=this.Canvas;
        paint.ChartBorder=this.Frame.SubFrame[0].Frame.ChartBorder;
        paint.ChartFrame=this.Frame.SubFrame[0].Frame;
        paint.Name="Overlay-Minute";
        this.OverlayChartPaint[0]=paint;

    }

    //切换成 脚本指标
    this.ChangeScriptIndex=function(windowIndex,indexData)
    {
        this.DeleteIndexPaint(windowIndex);
        this.WindowIndex[windowIndex]=new ScriptIndex(indexData.Name,indexData.Script,indexData.Args,indexData);    //脚本执行

        var bindData=this.SourceData;
        this.BindIndexData(windowIndex,bindData);   //执行脚本

        this.UpdataDataoffset();           //更新数据偏移
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Draw();
    }

    this.ChangeIndex=function(windowIndex,indexName)
    {
        if (this.Frame.SubFrame.length<3) return;

        //查找系统指标
        let scriptData = new JSIndexScript();
        let indexInfo = scriptData.Get(indexName);
        if (!indexInfo) return;
        if (windowIndex<2) windowIndex=2;
        if (windowIndex>=this.Frame.SubFrame.length) windowIndex=2;

        let indexData = 
        { 
            Name:indexInfo.Name, Script:indexInfo.Script, Args: indexInfo.Args, ID:indexName ,
            //扩展属性 可以是空
            KLineType:indexInfo.KLineType,  YSpecificMaxMin:indexInfo.YSpecificMaxMin,  YSplitScale:indexInfo.YSplitScale,
            FloatPrecision:indexInfo.FloatPrecision, Condition:indexInfo.Condition
        };
        
        return this.ChangeScriptIndex(windowIndex, indexData);
    }

    //切换股票代码
    this.ChangeSymbol=function(symbol)
    {
        this.Symbol=symbol;
        this.RequestData();
    }

    this.ChangeDayCount=function(count)
    {
        if (count<0 || count>10) return;
        this.DayCount=count;

        this.RequestData();
    }

    //叠加股票 只支持日线数据
    this.OverlaySymbol=function(symbol)
    {
        if (!this.OverlayChartPaint[0].MainData) return false;

        this.OverlayChartPaint[0].Symbol=symbol;

        if (this.DayCount<=1) this.RequestOverlayMinuteData();               //请求数据
        else this.RequestOverlayHistoryMinuteData();
        
        return true;
    }

    //取消叠加股票
    this.ClearOverlaySymbol=function()
    {
        this.OverlaySourceData=null;
        this.OverlayChartPaint[0].Symbol=null;
        this.OverlayChartPaint[0].Data=null;
        this.OverlayChartPaint[0].YClose=null;
        this.UpdateFrameMaxMin();
        this.Draw();
    }

    this.RequestData=function()
    {
        if (this.DayCount<=1) this.RequestMinuteData();               
        else this.RequestHistoryMinuteData();
    }

    //请求历史分钟数据
    this.RequestHistoryMinuteData=function()
    {
        var self=this;

        $.ajax({
            url: self.HistoryMinuteApiUrl,
            data:
            {
                "symbol": self.Symbol,
                "daycount": self.DayCount
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (data)
            {
                self.RecvHistoryMinuteData(data);
            }
        });
    }

    this.RecvHistoryMinuteData=function(data)
    {
        this.DayData=MinuteChartContainer.JsonDataToMinuteDataArray(data);;
        this.Symbol=data.symbol;
        this.Name=data.name;

        this.UpdateHistoryMinuteUI();

        this.RequestOverlayHistoryMinuteData();

        this.AutoUpdate();
    }

    this.UpdateHistoryMinuteUI=function()
    {
        var allMinuteData=this.HistoryMinuteDataToArray(this.DayData);

        //原始数据
        var sourceData=new ChartData();
        sourceData.Data=allMinuteData;

        this.SourceData=sourceData;
        this.TradeDate=this.DayData[0].Date;

        this.BindMainData(sourceData,this.DayData[0].YClose);
        if (MARKET_SUFFIX_NAME.IsChinaFutures(this.Symbol)) this.ChartPaint[1].Data=null;   //期货均线暂时不用

        if (this.Frame.SubFrame.length>2)
        {
            var bindData=new ChartData();
            bindData.Data=allMinuteData;
            for(var i=2; i<this.Frame.SubFrame.length; ++i)
            {
                this.BindIndexData(i,bindData);
            }
        }

        for(let i in this.Frame.SubFrame)
        {
            var item=this.Frame.SubFrame[i];
            item.Frame.XSplitOperator.Symbol=this.Symbol;
            item.Frame.XSplitOperator.DayCount=this.DayData.length;
            item.Frame.XSplitOperator.DayData=this.DayData;
            item.Frame.XSplitOperator.Operator();   //调整X轴个数
            item.Frame.YSplitOperator.Symbol=this.Symbol;
        }

        this.ChartCorssCursor.StringFormatY.Symbol=this.Symbol;
        this.ChartCorssCursor.StringFormatX.Symbol=this.Symbol;
        this.TitlePaint[0].IsShowDate=true;
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Frame.SetSizeChage(true);
        this.Draw();
    }

    this.HistoryMinuteDataToArray=function(data)
    {
        var result=[];
        for(var i=data.length-1; i>=0;--i)
        {
            var item=data[i];
            for(var j in item.Data)
            {
                result.push(item.Data[j]);
            }
        }
        return result;
    }

    this.UpdateLatestMinuteData=function(data,date)
    {
        for(var i in this.DayData)
        {
            var item=this.DayData[i];
            if (item.Date===date)
            {
                item.Data=data;
                break;
            }
        }
    }

    //请求分钟数据
    this.RequestMinuteData=function()
    {
        var self=this;

        var fields=
        [
            "name","symbol",
            "yclose","open","price","high","low",
            "vol","amount",
            "date","time",
            "minute","minutecount"
        ];

        var upperSymbol=this.Symbol.toUpperCase();
        if (MARKET_SUFFIX_NAME.IsChinaFutures(upperSymbol))
        {   //期货的需要加上结算价
            fields.push("clearing");
            fields.push("yclearing");
        }

        $.ajax({
            url: self.MinuteApiUrl,
            data:
            {
                "field": fields,
                "symbol": [self.Symbol],
                "start": -1
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (data)
            {
                self.RecvMinuteData(data);
            }
        });
    }

    this.RecvMinuteData=function(data)
    {
        var aryMinuteData=MinuteChartContainer.JsonDataToMinuteData(data);

        if (this.DayCount>1)    //多日走势图
        {
            this.UpdateLatestMinuteData(aryMinuteData,data.stock[0].date);
            this.UpdateHistoryMinuteUI();
            this.RequestOverlayMinuteData();    //请求叠加数据 (主数据下载完再下载)
            this.AutoUpdate();
            return;
        }

        //原始数据
        var sourceData=new ChartData();
        sourceData.Data=aryMinuteData;

        this.TradeDate=data.stock[0].date;

        this.SourceData=sourceData;
        this.Symbol=data.stock[0].symbol;
        this.Name=data.stock[0].name;

        var yClose=data.stock[0].yclose;
        var upperSymbol=this.Symbol.toUpperCase();
        if (data.stock[0].yclearing && MARKET_SUFFIX_NAME.IsChinaFutures(upperSymbol)) yClose=data.stock[0].yclearing; //期货使用前结算价
        this.BindMainData(sourceData,yClose);

        if (this.Frame.SubFrame.length>2)
        {
            var bindData=new ChartData();
            bindData.Data=aryMinuteData;
            for(var i=2; i<this.Frame.SubFrame.length; ++i)
            {
                this.BindIndexData(i,bindData);
            }
        }

        for(let i in this.Frame.SubFrame)
        {
            var item=this.Frame.SubFrame[i];
            item.Frame.XSplitOperator.Symbol=this.Symbol;
            item.Frame.XSplitOperator.DayCount=1;
            item.Frame.XSplitOperator.Operator();   //调整X轴个数
            item.Frame.YSplitOperator.Symbol=this.Symbol;
        }

        this.ChartCorssCursor.StringFormatY.Symbol=this.Symbol;
        this.ChartCorssCursor.StringFormatX.Symbol=this.Symbol;
        this.TitlePaint[0].IsShowDate=false;

        this.RequestOverlayMinuteData();//请求叠加数据 (主数据下载完再下载))

        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Frame.SetSizeChage(true);
        this.Draw();

        this.AutoUpdate();
    }

    //请求叠加数据 (主数据下载完再下载))
    this.RequestOverlayMinuteData=function()
    {
        if (!this.OverlayChartPaint.length) return;

        var symbol=this.OverlayChartPaint[0].Symbol;
        if (!symbol) return;

        var self = this;
        var date=this.TradeDate;    //最后一个交易日期
         //请求数据
         $.ajax({
            url: self.HistoryMinuteApiUrl,
            data:
            {
                "symbol":symbol,
                "days": [date],
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (data)
            {
                self.RecvOverlayMinuteData(data);
            }
        });
    }

    this.RecvOverlayMinuteData=function(data)
    {
        var aryMinuteData=MinuteChartContainer.JsonDataToMinuteDataArray(data);

        var sourceData=null;
        var yClose;
        if (this.DayCount>1)    //多日数据
        {
            if (aryMinuteData.length<=0) return;

            var minuteData=aryMinuteData[0];
            for(var i in this.OverlaySourceData)
            {
                var item=this.OverlaySourceData[i];
                if (item.Date==minuteData.Date)
                {
                    this.OverlaySourceData[i]=minuteData;
                    var allMinuteData=this.HistoryMinuteDataToArray(this.OverlaySourceData);
                    var sourceData=new ChartData();
                    sourceData.Data=allMinuteData;
                    yClose=minuteData.YClose;
                    break;
                }
            }
            if (sourceData==null) return;
        }
        else
        {
            if (aryMinuteData.length>0) sourceData=aryMinuteData[0];
            else sourceData=new ChartData();
            yClose=sourceData.YClose;
        }

        this.OverlayChartPaint[0].Data=sourceData;
        this.OverlayChartPaint[0].Title=data.name;
        this.OverlayChartPaint[0].Symbol=data.symbol;
        this.OverlayChartPaint[0].YClose=yClose;

        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Frame.SetSizeChage(true);
        this.Draw();
    }

    this.RequestOverlayHistoryMinuteData=function()
    {
        if (!this.OverlayChartPaint.length) return;
        var symbol=this.OverlayChartPaint[0].Symbol;
        if (!symbol) return;

        var self=this;
        var days=[];
        for(var i in this.DayData)
        {
            var item=this.DayData[i];
            days.push(item.Date);
        }

        if (days.length<=0) return;

        $.ajax({
            url: self.HistoryMinuteApiUrl,
            data:
            {
                "symbol": symbol,
                "days": days
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (data)
            {
                self.RecvOverlayHistoryMinuteData(data);
            }
        });
    }

    this.RecvOverlayHistoryMinuteData=function(data)    //叠加历史的分钟数据
    {
        var dayData=MinuteChartContainer.JsonDataToMinuteDataArray(data);
        var overlayDayData=[];
        for(var i in this.DayData)
        {
            var item=this.DayData[i];
            var bFind=false;
            for(var j in dayData)
            {
                if (item.Date==dayData[j].Date)
                {
                    overlayDayData.push(dayData[i]);
                    bFind=true;
                    break;
                }
            }
            if (!bFind) //当天不存在叠加数据, 存空
            {
                var empytData=new ChartData();
                empytData.Date=item.Date;
            }
        }

        this.OverlaySourceData=overlayDayData;
        var allMinuteData=this.HistoryMinuteDataToArray(overlayDayData);

        //原始数据
        var sourceData=new ChartData();
        sourceData.Data=allMinuteData;

        var yClose=overlayDayData[0].YClose;
        this.OverlayChartPaint[0].Data=sourceData;
        this.OverlayChartPaint[0].Title=data.name;
        this.OverlayChartPaint[0].Symbol=data.symbol;
        this.OverlayChartPaint[0].YClose=yClose;

        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Frame.SetSizeChage(true);
        this.Draw();
    }

    //数据自动更新
    this.AutoUpdate=function()
    {
        var self = this;

        if (!this.IsAutoUpdate) return;

        //9:30 - 15:40 非周6，日 每隔30秒更新一次 this.RequestMinuteData();
        var nowDate= new Date(),
            day = nowDate.getDay(),
            time = nowDate.getHours() * 100 + nowDate.getMinutes();

        if(day == 6 || day== 0) return ;

        if(time>1540) return ;

        var frequency=this.AutoUpdateFrequency;
        if(time <930){
            setTimeout(function(){
                self.AutoUpdate();
            },frequency);
        }else{
            setTimeout(function(){
                self.RequestMinuteData();
            },frequency);
        }
    }

    this.BindIndexData=function(windowIndex,hisData)
    {
        if (!this.WindowIndex[windowIndex]) return;

        if (typeof(this.WindowIndex[windowIndex].RequestData)=="function")          //数据需要另外下载的.
        {
            this.WindowIndex[windowIndex].RequestData(this,windowIndex,hisData);
            return;
        }
        if (typeof(this.WindowIndex[windowIndex].ExecuteScript)=='function')
        {
            this.WindowIndex[windowIndex].ExecuteScript(this,windowIndex,hisData);
            return;
        }

        this.WindowIndex[windowIndex].BindData(this,windowIndex,hisData);
    }

    //绑定分钟数据
    this.BindMainData=function(minuteData,yClose)
    {
        //分钟数据
        var bindData=new ChartData();
        bindData.Data=minuteData.GetClose();
        this.ChartPaint[0].Data=bindData;
        this.ChartPaint[0].YClose=yClose;
        this.ChartPaint[0].NotSupportMessage=null;
       
        this.Frame.SubFrame[0].Frame.YSplitOperator.YClose=yClose;
        this.Frame.SubFrame[0].Frame.YSplitOperator.Data=bindData;
        this.Frame.Data=this.ChartPaint[0].Data;

        //均线
        bindData=new ChartData();
        bindData.Data=minuteData.GetMinuteAvPrice();
        this.ChartPaint[1].Data=bindData;

        this.Frame.SubFrame[0].Frame.YSplitOperator.AverageData=bindData;
        this.Frame.SubFrame[0].Frame.YSplitOperator.OverlayChartPaint=this.OverlayChartPaint;

        //成交量
        this.ChartPaint[2].Data=minuteData;
        this.ChartPaint[2].YClose=yClose;

        this.TitlePaint[0].Data=this.SourceData;                    //动态标题
        this.TitlePaint[0].Symbol=this.Symbol;
        this.TitlePaint[0].Name=this.Name;
        this.TitlePaint[0].YClose=yClose;

        if (this.ExtendChartPaint[0])
        {
            this.ExtendChartPaint[0].Symbol=this.Symbol;
            this.ExtendChartPaint[0].Name=this.Name;
        }

        if (this.OverlayChartPaint.length>0)
        {
            this.OverlayChartPaint[0].MainData=this.ChartPaint[0].Data;         //叠加
            this.OverlayChartPaint[0].MainYClose=yClose;
        }
    }

    //获取子窗口的所有画法
    this.GetChartPaint=function(windowIndex)
    {
        var paint=new Array();
        for(var i in this.ChartPaint)
        {
            if (i<3) continue; //分钟 均线 成交量 3个线不能改

            var item=this.ChartPaint[i];
            if (item.ChartFrame==this.Frame.SubFrame[windowIndex].Frame)
                paint.push(item);
        }

        return paint;
    }

    //创建指定窗口指标
    this.CreateWindowIndex=function(windowIndex)
    {
        this.WindowIndex[windowIndex].Create(this,windowIndex);
    }

    //获取当前的显示的指标
    this.GetIndexInfo=function()
    {
        var aryIndex=[];
        for(var i in this.WindowIndex)
        {
            var item=this.WindowIndex[i];
            var info={Name:item.Name};
            if (item.ID) info.ID=item.ID;
            aryIndex.push(info);
        }

        return aryIndex;
    }
}

//API 返回数据 转化为array[]
MinuteChartContainer.JsonDataToMinuteData=function(data)
{
    var symbol=data.stock[0].symbol;
    var upperSymbol=symbol.toUpperCase();
    var isSHSZ=MARKET_SUFFIX_NAME.IsSHSZ(upperSymbol);
    var isFutures=MARKET_SUFFIX_NAME.IsChinaFutures(upperSymbol);
    var aryMinuteData=new Array();
    var preClose=data.stock[0].yclose;      //前一个数据价格
    var preAvPrice=data.stock[0].yclose;    //前一个均价
    var yClose=data.stock[0].yclose;
    if (isFutures && data.stock[0].yclearing) yClose=preClose=preAvPrice=data.stock[0].yclearing;  //期货使用昨结算价
    
    for(var i in data.stock[0].minute)
    {
        var jsData=data.stock[0].minute[i];
        var item=new MinuteData();
        if (jsData.price) preClose=jsData.price;
        if (jsData.avprice) preAvPrice=jsData.avprice;

        item.Close=jsData.price;
        item.Open=jsData.open;
        item.High=jsData.high;
        item.Low=jsData.low;
        if (isSHSZ) item.Vol=jsData.vol/100; //沪深股票原始单位股
        else item.Vol=jsData.vol;
        item.Amount=jsData.amount;
        item.DateTime=data.stock[0].date.toString()+" "+jsData.time.toString();

        if (i==0) 
        {
            item.IsFristData=true;
            if(isSHSZ) item.DateTime=data.stock[0].date.toString() + " 0925"; //沪深股票 第1个数据 写死9：25
        }
        
        item.Increase=jsData.increase;
        item.Risefall=jsData.risefall;
        item.AvPrice=jsData.avprice;

        if (!item.Close) //当前没有价格 使用上一个价格填充
        {
            item.Close=preClose;
            item.Open=item.High=item.Low=item.Close;
        }
        if (!item.AvPrice) item.AvPrice=preAvPrice;

        //价格是0的 都用空
        if (item.Open<=0) item.Open=null;
        if (item.Close<=0) item.Close=null;
        if (item.AvPrice<=0) item.AvPrice=null;
        if (item.High<=0) item.High=null;
        if (item.Low<=0) item.Low=null;

        if (isFutures) item.AvPrice=null;    //期货均价暂时没有
            
        if (yClose && item.Close) item.Increase=(item.Close-yClose)/yClose*100; //涨幅 (最新价格-昨收)/昨收*100;

        aryMinuteData[i]=item;
    }

    return aryMinuteData;
}

//多日日线数据API 转化成array[];
MinuteChartContainer.JsonDataToMinuteDataArray=function(data)
{
    var symbol=data.symbol;
    var upperSymbol=symbol.toUpperCase();
    var isSHSZ=MARKET_SUFFIX_NAME.IsSHSZ(upperSymbol);
    var isFutures=MARKET_SUFFIX_NAME.IsChinaFutures(upperSymbol);
    var result=[];
    for(var i in data.data)
    {
        var minuteData=[];
        var dayData=data.data[i];
        var date=dayData.date;
        var yClose=dayData.yclose;  //前收盘 计算涨幅
        var preClose=yClose;        //前一个数据价格
        var preAvPrice=null;           //上一个均价
        //var preAvPrice=data.stock[0].yclose;    //前一个均价
        for(var j in dayData.minute)
        {
            var jsData=dayData.minute[j];
            if (jsData[2]) preClose=jsData[2];  //保存上一个收盘数据
            var item=new MinuteData();
            item.Close=jsData[2];
            item.Open=jsData[1];
            item.High=jsData[3];
            item.Low=jsData[4];
            item.Vol=jsData[5]/100; //原始单位股
            item.Amount=jsData[6];
            if (7<jsData.length && jsData[7]>0) 
            {
                item.AvPrice=jsData[7];    //均价
                preAvPrice=jsData[7];
            }
            item.DateTime=date.toString()+" "+jsData[0].toString();
            
            if (!item.Close)    //当前没有价格 使用上一个价格填充
            {
                item.Close=preClose;   
                item.Open=item.High=item.Low=item.Close;
            }

            if (!item.AvPrice && preAvPrice) item.AvPrice=preAvPrice;

            if (item.Close && yClose) item.Increase = (item.Close - yClose)/yClose*100;
            else item.Increase=null;
            if (j==0)      //第1个数据 写死9：25
            {
                if (isSHSZ) item.DateTime=date.toString()+" 0925";
                item.IsFristData=true;
            }

            //价格是0的 都用空
            if (item.Open<=0) item.Open=null;
            if (item.Close<=0) item.Close=null;
            if (item.AvPrice<=0) item.AvPrice=null;
            if (item.High<=0) item.High=null;
            if (item.Low<=0) item.Low=null;
            if (item.AvPrice<=0) item.AvPrice=null;

            minuteData[j]=item;
        }

        var newData=new ChartData();
        newData.Data=minuteData;
        newData.YClose=yClose;
        newData.Close=dayData.close;
        newData.Date=date;

        result.push(newData);
    }

    return result;
}

/*
    历史分钟走势图
*/
function HistoryMinuteChartContainer(uielement)
{
    this.newMethod=MinuteChartContainer;   //派生
    this.newMethod(uielement);
    delete this.newMethod;

    this.HistoryMinuteApiUrl="https://opensourcecache.zealink.com/cache/minuteday/day/";
    this.ClassName='HistoryMinuteChartContainer';

    //创建主图K线画法
    this.CreateMainKLine=function()
    {
        //分钟线
        var minuteLine=new ChartMinutePriceLine();
        minuteLine.Canvas=this.Canvas;
        minuteLine.ChartBorder=this.Frame.SubFrame[0].Frame.ChartBorder;
        minuteLine.ChartFrame=this.Frame.SubFrame[0].Frame;
        minuteLine.Name="Minute-Line";
        minuteLine.Color=g_JSChartResource.Minute.PriceColor;

        this.ChartPaint[0]=minuteLine;

        //分钟线均线
        var averageLine=new ChartLine();
        averageLine.Canvas=this.Canvas;
        averageLine.ChartBorder=this.Frame.SubFrame[0].Frame.ChartBorder;
        averageLine.ChartFrame=this.Frame.SubFrame[0].Frame;
        averageLine.Name="Minute-Average-Line";
        averageLine.Color=g_JSChartResource.Minute.AvPriceColor;
        this.ChartPaint[1]=averageLine;

        var averageLine=new ChartMinuteVolumBar();
        averageLine.Color=g_JSChartResource.Minute.VolBarColor;
        averageLine.Canvas=this.Canvas;
        averageLine.ChartBorder=this.Frame.SubFrame[1].Frame.ChartBorder;
        averageLine.ChartFrame=this.Frame.SubFrame[1].Frame;
        averageLine.Name="Minute-Vol-Bar";
        this.ChartPaint[2]=averageLine;


        this.TitlePaint[0]=new DynamicMinuteTitlePainting();
        this.TitlePaint[0].Frame=this.Frame.SubFrame[0].Frame;
        this.TitlePaint[0].Canvas=this.Canvas;
        this.TitlePaint[0].IsShowDate=true;

        /*
        //主图叠加画法
        var paint=new ChartOverlayKLine();
        paint.Canvas=this.Canvas;
        paint.ChartBorder=this.Frame.SubFrame[0].Frame.ChartBorder;
        paint.ChartFrame=this.Frame.SubFrame[0].Frame;
        paint.Name="Overlay-KLine";
        this.OverlayChartPaint[0]=paint;
        */

    }

    //设置交易日期
    this.ChangeTradeDate=function(trdateDate)
    {
        if (!trdateDate) return;

        this.TradeDate=trdateDate;
        this.RequestData(); //更新数据
    }

    this.RequestData=function()
    {
        var date=new Date();
        var nowDate=date.getFullYear()*10000+(date.getMonth()+1)*100+date.getDate();
        if (nowDate==this.TradeDate) this.RequestMinuteData();
        else this.RequestHistoryMinuteData();
    }

    //请求分钟数据
    this.RequestHistoryMinuteData=function()
    {
        var _self=this;
        var url=this.HistoryMinuteApiUrl+this.TradeDate.toString()+"/"+this.Symbol+".json";

        $.ajax({
            url: url,
            type:"get",
            dataType: "json",
            async:true,
            success: function (data)
            {
                _self.RecvHistoryMinuteData(data);
            },
            error:function(reqeust)
            {
                _self.RecvHistoryMinuteError(reqeust);
            }
        });
    }

    this.RecvHistoryMinuteError=function(reqeust)
    {
        if (reqeust.status!=404) return;

        var sourceData=new ChartData();
        this.SourceData=sourceData;

        for(var i in this.ChartPaint)
        {
            this.ChartPaint[i].Data=sourceData;
            if (i==0) this.ChartPaint[i].NotSupportMessage='没有权限访问!';
        }

        this.TitlePaint[0].Data=this.SourceData;                    //动态标题
        this.TitlePaint[0].Symbol=this.Symbol;
        this.TitlePaint[0].Name=null;

        this.Draw();
    }

    this.RecvHistoryMinuteData=function(data)
    {
        var aryMinuteData=HistoryMinuteChartContainer.JsonDataToMinuteData(data);

        //原始数据
        var sourceData=new ChartData();
        sourceData.Data=aryMinuteData;

        this.TradeDate=data.date;

        this.SourceData=sourceData;
        this.Symbol=data.symbol;
        this.Name=data.name;

        this.BindMainData(sourceData,data.day.yclose);

        if (this.Frame.SubFrame.length>2)
        {
            var bindData=new ChartData();
            bindData.Data=aryMinuteData;
            for(var i=2; i<this.Frame.SubFrame.length; ++i)
            {
                this.BindIndexData(i,bindData);
            }
        }

        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Frame.SetSizeChage(true);
        this.Draw();

        //this.AutoUpdata();
    }

}

//API 返回数据 转化为array[]
HistoryMinuteChartContainer.JsonDataToMinuteData=function(data)
{
    var aryMinuteData=new Array();
    for(var i in data.minute.time)
    {
        var item=new MinuteData();

        if (data.minute.price[i]<=0 && i>0) //当前这一分钟价格为空,使用上一分钟的数据
        {
            item.Close=aryMinuteData[i-1].Close;
            item.Open=aryMinuteData[i-1].Close;
            item.High=item.Close;
            item.Low=item.Close;
            item.Vol=data.minute.vol[i]; //原始单位股
            item.Amount=data.minute.amount[i];
            item.DateTime=data.date.toString()+" "+data.minute.time[i].toString();
            //item.Increate=jsData.increate;
            //item.Risefall=jsData.risefall;
            item.AvPrice=aryMinuteData[i-1].AvPrice;
        }
        else
        {
            item.Close=data.minute.price[i];
            item.Open=data.minute.open[i];
            item.High=data.minute.high[i];
            item.Low=data.minute.low[i];
            item.Vol=data.minute.vol[i]; //原始单位股
            item.Amount=data.minute.amount[i];
            item.DateTime=data.date.toString()+" "+data.minute.time[i].toString();
            //item.Increate=jsData.increate;
            //item.Risefall=jsData.risefall;
            item.AvPrice=data.minute.avprice[i];
        }

        //价格是0的 都用空
        if (item.Open<=0) item.Open=null;
        if (item.Close<=0) item.Close=null;
        if (item.AvPrice<=0) item.AvPrice=null;
        if (item.High<=0) item.High=null;
        if (item.Low<=0) item.Low=null;

        aryMinuteData[i]=item;
    }

    return aryMinuteData;
}

/////////////////////////////////////////////////////////////////////////////
//  自定义指数
//
function CustomKLineChartContainer(uielement)
{
    this.newMethod=KLineChartContainer;   //派生
    this.newMethod(uielement);
    delete this.newMethod;

    this.ClassName='CustomKLineChartContainer';
    this.CustomKLineApiUrl=g_JSChartResource.Domain+"/API/IndexCalculate";                        //自定义指数计算地址
    this.CustomStock;   //成分
    this.QueryDate={Start:20180101,End:20180627} ;     //计算时间区间

    this.RequestHistoryData=function()
    {
        var self=this;
        this.ChartSplashPaint.IsEnableSplash = true;
        this.Draw();
        $.ajax({
            url: this.CustomKLineApiUrl,
            data:
            {
                "stock": self.CustomStock,
                "Name": self.Symbol,
                "date": { "startdate":self.QueryDate.Start,"enddate":self.QueryDate.End }
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (data)
            {
                self.ChartSplashPaint.IsEnableSplash = false;
                self.RecvHistoryData(data);
            }
        });
    }

    this.RecvHistoryData=function(data)
    {
        var aryDayData=KLineChartContainer.JsonDataToHistoryData(data);

        //原始数据
        var sourceData=new ChartData();
        sourceData.Data=aryDayData;
        sourceData.DataType=0;      //0=日线数据 1=分钟数据

        //显示的数据
        var bindData=new ChartData();
        bindData.Data=aryDayData;
        bindData.Right=this.Right;
        bindData.Period=this.Period;
        bindData.DataType=0;

        if (bindData.Right>0)    //复权
        {
            var rightData=bindData.GetRightDate(bindData.Right);
            bindData.Data=rightData;
        }

        if (bindData.Period>0 && bindData.Period<=3)   //周期数据
        {
            var periodData=sourceData.GetPeriodData(bindData.Period);
            bindData.Data=periodData;
        }

        //绑定数据
        this.SourceData=sourceData;
        this.Name=data.name;
        this.BindMainData(bindData,this.PageSize);

        for(var i=0; i<this.Frame.SubFrame.length; ++i)
        {
            this.BindIndexData(i,bindData);
        }

        //刷新画图
        this.UpdataDataoffset();           //更新数据偏移
        this.UpdatePointByCursorIndex();   //更新十字光标位子
        this.UpdateFrameMaxMin();          //调整坐标最大 最小值
        this.Frame.SetSizeChage(true);
        this.Draw();
        
    }

}

////////////////////////////////////////////////////////////////////////////////
//  K线训练
//
function KLineTrainChartContainer(uielement, bHScreen)
{
    if (bHScreen===true)
    {
        this.newMethod=KLineChartHScreenContainer;   //派生
        this.newMethod(uielement);
        delete this.newMethod;
    }
    else
    {
        this.newMethod=KLineChartContainer;   //派生
        this.newMethod(uielement);
        delete this.newMethod;
    }

    this.BuySellPaint;          //买卖点画法
    this.TrainDataCount=300;    //训练数据个数
    this.AutoRunTimer=null;     //K线自动前进定时器
    this.BuySellData=[];        //模拟买卖数据 {Buy:{Price:价格,Date:日期} , Sell:{Price:价格,Date:日期} 
    this.TrainDataIndex;        //当前训练的数据索引
    this.TrainCallback;         //训练回调 (K线每前进一次就调用一次)
    this.DragMode=0;

    this.TrainStartEnd={};

    //TODO: 鼠标键盘消息全部要禁掉
    this.OnKeyDown=function(e)
    {
        //不让滚动条滚动
        if(e.preventDefault) e.preventDefault();    
        else e.returnValue = false;
    }

     //手机拖拽
    uielement.ontouchstart=function(e)
    {
        if(!this.JSChartContainer) return;
        this.JSChartContainer.PhonePinch=null;

        e.preventDefault();
        var jsChart=this.JSChartContainer;

        if (jsChart.IsPhoneDragging(e))
        {
            var drag=
            {
                "Click":{},
                "LastMove":{}  //最后移动的位置
            };

            var touches=jsChart.GetToucheData(e,false);

            drag.Click.X=touches[0].clientX;
            drag.Click.Y=touches[0].clientY;
            drag.LastMove.X=touches[0].clientX;
            drag.LastMove.Y=touches[0].clientY;

            if (drag.Click.X==drag.LastMove.X && drag.Click.Y==drag.LastMove.Y) //手指没有移动，出现十字光标
            {
                var mouseDrag=jsChart.MouseDrag;
                jsChart.MouseDrag=null;
                //移动十字光标
                var pixelTatio = GetDevicePixelRatio();
                var x = drag.Click.X-uielement.getBoundingClientRect().left*pixelTatio;
                var y = drag.Click.Y-uielement.getBoundingClientRect().top*pixelTatio;
                jsChart.OnMouseMove(x,y,e);
            }

            document.JSChartContainer=this.JSChartContainer;
            this.JSChartContainer.SelectChartDrawPicture=null;
        }
        else if (jsChart.IsPhonePinching(e))
        {
            var phonePinch=
            {
                "Start":{},
                "Last":{}
            };

            var touches=jsChart.GetToucheData(e,false);

            phonePinch.Start={"X":touches[0].pageX,"Y":touches[0].pageY,"X2":touches[1].pageX,"Y2":touches[1].pageY};
            phonePinch.Last={"X":touches[0].pageX,"Y":touches[0].pageY,"X2":touches[1].pageX,"Y2":touches[1].pageY};

            this.JSChartContainer.PhonePinch=phonePinch;
            document.JSChartContainer=this.JSChartContainer;
            this.JSChartContainer.SelectChartDrawPicture=null;
        }

        uielement.ontouchmove=function(e)
        {
            if(!this.JSChartContainer) return;
            e.preventDefault();

            var touches=jsChart.GetToucheData(e,false);

            if (jsChart.IsPhoneDragging(e))
            {
                var drag=this.JSChartContainer.MouseDrag;
                if (drag==null)
                {
                    var pixelTatio = GetDevicePixelRatio();
                    var x = touches[0].clientX-this.getBoundingClientRect().left*pixelTatio;
                    var y = touches[0].clientY-this.getBoundingClientRect().top*pixelTatio;
                    this.JSChartContainer.OnMouseMove(x,y,e);
                }
                else
                {
                    
                }
            }else if (jsChart.IsPhonePinching(e))
            {
                phonePinch.Last={"X":touches[0].pageX,"Y":touches[0].pageY,"X2":touches[1].pageX,"Y2":touches[1].pageY};
            }
        };

        uielement.ontouchend=function(e)
        {
            clearTimeout(timeout);
        }

    }


    this.CreateBuySellPaint=function()  //在主窗口建立以后 创建买卖点
    {
        var chart=new ChartBuySell();
        chart.Canvas=this.Canvas;
        chart.ChartBorder=this.Frame.SubFrame[0].Frame.ChartBorder;
        chart.ChartFrame=this.Frame.SubFrame[0].Frame;
        chart.Name="KLine-Train-BuySell";
        this.ChartPaintEx[0]=chart;
    }

    this.BindMainData=function(hisData,showCount)   //数据到达绑定主图K线数据
    {
        this.ChartPaint[0].Data=hisData;
        for(var i in this.Frame.SubFrame)
        {
            var item =this.Frame.SubFrame[i].Frame;
            item.XPointCount=showCount;
            item.Data=this.ChartPaint[0].Data;
        }

        this.TitlePaint[0].Data=this.ChartPaint[0].Data;                    //动态标题
        this.TitlePaint[0].Symbol=this.Symbol;
        this.TitlePaint[0].Name=this.Name;

        this.ChartCorssCursor.StringFormatX.Data=this.ChartPaint[0].Data;   //十字光标
        this.Frame.Data=this.ChartPaint[0].Data;

        if (!this.ChartPaintEx[0]) this.CreateBuySellPaint();
        this.ChartPaintEx[0].Data=this.ChartPaint[0].Data;

        this.OverlayChartPaint[0].MainData=this.ChartPaint[0].Data;         //K线叠加

        var dataOffset=hisData.Data.length-showCount-this.TrainDataCount-20;   //随机选一段数据进行训练
        if (dataOffset<0) dataOffset=0;
        this.ChartPaint[0].Data.DataOffset=dataOffset;

        this.CursorIndex=showCount;
        if (this.CursorIndex+dataOffset>=hisData.Data.length) this.CursorIndex=dataOffset;

        this.TrainDataIndex=this.CursorIndex;

        this.TrainStartEnd.Start=hisData.Data[this.TrainDataIndex+dataOffset-1];
    }

    this.Run=function()
    {
        if (this.AutoRunTimer) return;
        if (this.TrainDataCount<=0) return;

        var self=this;
        this.AutoRunTimer=setInterval(function()
        {
            if (!self.MoveNextKLineData()) clearInterval(self.AutoRunTimer);
        }, 1000);
    }

    this.MoveNextKLineData=function()
    {
        if (this.TrainDataCount<=0) return false;

        var xPointcount=0;
        if (this.Frame.XPointCount) xPointcount=this.Frame.XPointCount; //数据个数
        if (this.TrainDataIndex+1>=xPointcount)
        {
            this.CursorIndex=this.TrainDataIndex;
            if (!this.DataMoveRight()) return false;
            this.UpdataDataoffset();
            this.UpdatePointByCursorIndex();
            this.UpdateFrameMaxMin();
            this.Draw();
            ++this.TrainDataIndex;
            --this.TrainDataCount;

            if (this.TrainDataCount<=0) 
            {
                this.FinishTrainData();
                this.UpdateTrainUICallback();
                return false;
            }

            this.UpdateTrainUICallback();
            return true;
        }

        return false;
    }

    this.UpdateTrainUICallback=function()
    {
        var buySellPaint=this.ChartPaintEx[0];
        var lastData=buySellPaint.LastData.Data;
        this.TrainStartEnd.End=lastData;

        if (this.TrainCallback) this.TrainCallback(this);
    }

    this.FinishTrainData=function()
    {
        var buySellPaint=this.ChartPaintEx[0];
        if (buySellPaint && this.BuySellData.length)    //取最后1条数据 看是否卖了
        {
            var lastData=buySellPaint.LastData.Data;
            var item=this.BuySellData[this.BuySellData.length-1];
            if (!item.Sell)
            {
                item.Sell={Price:lastData.Close,Date:lastData.Date};
                buySellPaint.BuySellData.set(lastData.Date,{Op:1});
            }
        } 
    }

    this.GetLastBuySellData=function()   //取最后1条数据
    {
        var buySellPaint=this.ChartPaintEx[0];
        if (!buySellPaint) return null;

        if (this.BuySellData.length)   
        {
            var item=this.BuySellData[this.BuySellData.length-1];
            return item;
        } 

        return null;
    }

    this.GetOperator=function()     //获取当前是卖/买
    {
        var buySellData=this.GetLastBuySellData();
        if (buySellData && buySellData.Buy && !buySellData.Sell) return 1;

        return 0;
    }

    this.Stop=function()
    {
        if (this.AutoRunTimer!=null) clearInterval(this.AutoRunTimer);
        this.AutoRunTimer=null;
    }

    this.BuyOrSell=function()   //模拟买卖
    {
        var buySellPaint=this.ChartPaintEx[0];
        var lastData=buySellPaint.LastData.Data;
        var buySellData=this.GetLastBuySellData();
        if (buySellData && buySellData.Buy && !buySellData.Sell)
        {
            buySellData.Sell={Price:lastData.Close,Date:lastData.Date};
            buySellPaint.BuySellData.set(lastData.Date,{Op:1});
            this.MoveNextKLineData();
            return;
        }
        
        this.BuySellData.push({ Buy:{Price:lastData.Close,Date:lastData.Date}, Sell:null });
        buySellPaint.BuySellData.set(lastData.Date,{Op:0});
        this.MoveNextKLineData();
    }
}

////////////////////////////////////////////////////////////////////////////////
//  K线横屏显示
//
function KLineChartHScreenContainer(uielement)
{
    this.newMethod=KLineChartContainer;   //派生
    this.newMethod(uielement);
    delete this.newMethod;

    this.ClassName='KLineChartHScreenContainer';

    this.OnMouseMove=function(x,y,e)
    {
        this.LastPoint.X=x;
        this.LastPoint.Y=y;
        this.CursorIndex=this.Frame.GetXData(y);

        this.DrawDynamicInfo();
    }

    uielement.onmousedown=function(e)   //鼠标拖拽
    {
        if(!this.JSChartContainer) return;
        if(this.JSChartContainer.DragMode==0) return;

        if (this.JSChartContainer.TryClickLock)
        {
            var x = e.clientX-this.getBoundingClientRect().left;
            var y = e.clientY-this.getBoundingClientRect().top;
            if (this.JSChartContainer.TryClickLock(x,y)) return;
        }


        var drag=
        {
            "Click":{},
            "LastMove":{}  //最后移动的位置
        };

        drag.Click.X=e.clientX;
        drag.Click.Y=e.clientY;
        drag.LastMove.X=e.clientX;
        drag.LastMove.Y=e.clientY;

        this.JSChartContainer.MouseDrag=drag;
        document.JSChartContainer=this.JSChartContainer;
        this.JSChartContainer.SelectChartDrawPicture=null;

        uielement.ondblclick=function(e)
        {
            var x = e.clientX-this.getBoundingClientRect().left;
            var y = e.clientY-this.getBoundingClientRect().top;

            if(this.JSChartContainer)
                this.JSChartContainer.OnDoubleClick(x,y,e);
        }

        document.onmousemove=function(e)
        {
            if(!this.JSChartContainer) return;
            //加载数据中,禁用鼠标事件
            if (this.JSChartContainer.ChartSplashPaint && this.JSChartContainer.ChartSplashPaint.IsEnableSplash == true) return;

            var drag=this.JSChartContainer.MouseDrag;
            if (!drag) return;

            var moveSetp=Math.abs(drag.LastMove.Y-e.clientY);

            if (this.JSChartContainer.DragMode==1)  //数据左右拖拽
            {
                if (moveSetp<5) return;

                var isLeft=true;
                if (drag.LastMove.Y<e.clientY) isLeft=false;//右移数据

                if(this.JSChartContainer.DataMove(moveSetp,isLeft))
                {
                    this.JSChartContainer.UpdataDataoffset();
                    this.JSChartContainer.UpdatePointByCursorIndex();
                    this.JSChartContainer.UpdateFrameMaxMin();
                    this.JSChartContainer.ResetFrameXYSplit();
                    this.JSChartContainer.Draw();
                }

                drag.LastMove.X=e.clientX;
                drag.LastMove.Y=e.clientY;
            }
        };

        document.onmouseup=function(e)
        {
            //清空事件
            document.onmousemove=null;
            document.onmouseup=null;

            //清空数据
            this.JSChartContainer.MouseDrag=null;
            this.JSChartContainer.CurrentChartDrawPicture=null;
            this.JSChartContainer=null;
        }
    }

      //手机拖拽
      uielement.ontouchstart=function(e)
      {
          if(!this.JSChartContainer) return;
          if(this.JSChartContainer.DragMode==0) return;
  
          this.JSChartContainer.PhonePinch=null;
  
          e.preventDefault();
          var jsChart=this.JSChartContainer;
  
          if (jsChart.IsPhoneDragging(e))
          {
              //长按2秒,十字光标
              var timeout=setTimeout(function()
              {
                  if (drag.Click.X==drag.LastMove.X && drag.Click.Y==drag.LastMove.Y) //手指没有移动，出现十字光标
                  {
                      var mouseDrag=jsChart.MouseDrag;
                      jsChart.MouseDrag=null;
                      //移动十字光标
                      var pixelTatio = GetDevicePixelRatio();
                      var x = drag.Click.X-uielement.getBoundingClientRect().left*pixelTatio;
                      var y = drag.Click.Y-uielement.getBoundingClientRect().top*pixelTatio;
                      jsChart.OnMouseMove(x,y,e);
                  }
  
              }, 1000);
  
              var drag=
              {
                  "Click":{},
                  "LastMove":{}  //最后移动的位置
              };
  
              var touches=jsChart.GetToucheData(e,false);
  
              drag.Click.X=touches[0].clientX;
              drag.Click.Y=touches[0].clientY;
              drag.LastMove.X=touches[0].clientX;
              drag.LastMove.Y=touches[0].clientY;
  
              this.JSChartContainer.MouseDrag=drag;
              document.JSChartContainer=this.JSChartContainer;
              this.JSChartContainer.SelectChartDrawPicture=null;
          }
          else if (jsChart.IsPhonePinching(e))
          {
              var phonePinch=
              {
                  "Start":{},
                  "Last":{}
              };
  
              var touches=jsChart.GetToucheData(e,false);
  
              phonePinch.Start={"X":touches[0].pageX,"Y":touches[0].pageY,"X2":touches[1].pageX,"Y2":touches[1].pageY};
              phonePinch.Last={"X":touches[0].pageX,"Y":touches[0].pageY,"X2":touches[1].pageX,"Y2":touches[1].pageY};
  
              this.JSChartContainer.PhonePinch=phonePinch;
              document.JSChartContainer=this.JSChartContainer;
              this.JSChartContainer.SelectChartDrawPicture=null;
          }
  
          uielement.ontouchmove=function(e)
          {
              if(!this.JSChartContainer) return;
              e.preventDefault();
  
              var touches=jsChart.GetToucheData(e,false);
  
              if (jsChart.IsPhoneDragging(e))
              {
                  var drag=this.JSChartContainer.MouseDrag;
                  if (drag==null)
                  {
                      var pixelTatio = GetDevicePixelRatio();
                      var x = touches[0].clientX-this.getBoundingClientRect().left*pixelTatio;
                      var y = touches[0].clientY-this.getBoundingClientRect().top*pixelTatio;
                      this.JSChartContainer.OnMouseMove(x,y,e);
                  }
                  else
                  {
                      var moveSetp=Math.abs(drag.LastMove.Y-touches[0].clientY);
                      moveSetp=parseInt(moveSetp);
                      if (this.JSChartContainer.DragMode==1)  //数据左右拖拽
                      {
                          if (moveSetp<5) return;
  
                          var isLeft=true;
                          if (drag.LastMove.Y<touches[0].clientY) isLeft=false;//右移数据
  
                          if(this.JSChartContainer.DataMove(moveSetp,isLeft))
                          {
                              this.JSChartContainer.UpdataDataoffset();
                              this.JSChartContainer.UpdatePointByCursorIndex();
                              this.JSChartContainer.UpdateFrameMaxMin();
                              this.JSChartContainer.ResetFrameXYSplit();
                              this.JSChartContainer.Draw();
                          }
  
                          drag.LastMove.X=touches[0].clientX;
                          drag.LastMove.Y=touches[0].clientY;
                      }
                  }
              }else if (jsChart.IsPhonePinching(e))
              {
                  var phonePinch=this.JSChartContainer.PhonePinch;
                  if (!phonePinch) return;
  
                  var yHeight=Math.abs(touches[0].pageX-touches[1].pageX);
                  var yLastHeight=Math.abs(phonePinch.Last.X-phonePinch.Last.X2);
                  var yStep=yHeight-yLastHeight;
                  if (Math.abs(yStep)<5) return;
  
                  if (yStep>0)    //放大
                  {
                      var cursorIndex={};
                      cursorIndex.Index=parseInt(Math.abs(this.JSChartContainer.CursorIndex-0.5).toFixed(0));
                      if (!this.JSChartContainer.Frame.ZoomUp(cursorIndex)) return;
                      this.JSChartContainer.CursorIndex=cursorIndex.Index;
                      this.JSChartContainer.UpdatePointByCursorIndex();
                      this.JSChartContainer.UpdataDataoffset();
                      this.JSChartContainer.UpdateFrameMaxMin();
                      this.JSChartContainer.Draw();
                      this.JSChartContainer.ShowTooltipByKeyDown();
                  }
                  else        //缩小
                  {
                      var cursorIndex={};
                      cursorIndex.Index=parseInt(Math.abs(this.JSChartContainer.CursorIndex-0.5).toFixed(0));
                      if (!this.JSChartContainer.Frame.ZoomDown(cursorIndex)) return;
                      this.JSChartContainer.CursorIndex=cursorIndex.Index;
                      this.JSChartContainer.UpdataDataoffset();
                      this.JSChartContainer.UpdatePointByCursorIndex();
                      this.JSChartContainer.UpdateFrameMaxMin();
                      this.JSChartContainer.Draw();
                      this.JSChartContainer.ShowTooltipByKeyDown();
                  }
  
                  phonePinch.Last={"X":touches[0].pageX,"Y":touches[0].pageY,"X2":touches[1].pageX,"Y2":touches[1].pageY};
              }
          };
  
          uielement.ontouchend=function(e)
          {
              clearTimeout(timeout);
          }
  
      }

    //创建
    //windowCount 窗口个数
    this.Create=function(windowCount)
    {
        this.UIElement.JSChartContainer=this;

        //创建十字光标
        this.ChartCorssCursor=new ChartCorssCursor();
        this.ChartCorssCursor.Canvas=this.Canvas;
        this.ChartCorssCursor.StringFormatX=new HQDateStringFormat();
        this.ChartCorssCursor.StringFormatY=new HQPriceStringFormat();

        //创建等待提示
        this.ChartSplashPaint = new ChartSplashPaint();
        this.ChartSplashPaint.Canvas = this.Canvas;

        //创建框架容器
        this.Frame=new HQTradeHScreenFrame();
        this.Frame.ChartBorder=new ChartBorder();
        this.Frame.ChartBorder.UIElement=this.UIElement;
        this.Frame.ChartBorder.Top=30;
        this.Frame.ChartBorder.Left=5;
        this.Frame.ChartBorder.Bottom=20;
        this.Frame.Canvas=this.Canvas;
        this.ChartCorssCursor.Frame=this.Frame; //十字光标绑定框架
        this.ChartSplashPaint.Frame = this.Frame;

        this.CreateChildWindow(windowCount);
        this.CreateMainKLine();

        //子窗口动态标题
        for(var i in this.Frame.SubFrame)
        {
            var titlePaint=new DynamicChartTitlePainting();
            titlePaint.Frame=this.Frame.SubFrame[i].Frame;
            titlePaint.Canvas=this.Canvas;

            this.TitlePaint.push(titlePaint);
        }

        this.UIElement.addEventListener("keydown", OnKeyDown, true);    //键盘消息
    }

    //创建子窗口
    this.CreateChildWindow=function(windowCount)
    {
        for(var i=0;i<windowCount;++i)
        {
            var border=new ChartBorder();
            border.UIElement=this.UIElement;

            var frame=new KLineHScreenFrame();
            frame.Canvas=this.Canvas;
            frame.ChartBorder=border;
            frame.Identify=i;                   //窗口序号

            if (this.ModifyIndexDialog) frame.ModifyIndexEvent=this.ModifyIndexDialog.DoModal;        //绑定菜单事件
            if (this.ChangeIndexDialog) frame.ChangeIndexEvent=this.ChangeIndexDialog.DoModal;

            frame.HorizontalMax=20;
            frame.HorizontalMin=10;

            if (i==0)
            {
                frame.YSplitOperator=new FrameSplitKLinePriceY();
                frame.YSplitOperator.FrameSplitData=this.FrameSplitData.get('price');
                //主图上下间距
                var pixelTatio = GetDevicePixelRatio(); //获取设备的分辨率
                border.TopSpace=12*pixelTatio;
                border.BottomSpace=12*pixelTatio;
            }
            else
            {
                frame.YSplitOperator=new FrameSplitY();
                frame.YSplitOperator.FrameSplitData=this.FrameSplitData.get('double');
                //frame.IsLocked = true;
            }

            frame.YSplitOperator.Frame=frame;
            frame.YSplitOperator.ChartBorder=border;
            frame.XSplitOperator=new FrameSplitKLineX();
            frame.XSplitOperator.Frame=frame;
            frame.XSplitOperator.ChartBorder=border;

            if (i!=windowCount-1) frame.XSplitOperator.ShowText=false;

            for(var j=frame.HorizontalMin;j<=frame.HorizontalMax;j+=1)
            {
                frame.HorizontalInfo[j]= new CoordinateInfo();
                frame.HorizontalInfo[j].Value=j;
                if (i==0 && j==frame.HorizontalMin) continue;

                frame.HorizontalInfo[j].Message[1]=j.toString();
                frame.HorizontalInfo[j].Font="14px 微软雅黑";
            }

            var subFrame=new SubFrameItem();
            subFrame.Frame=frame;
            if (i==0)
                subFrame.Height=20;
            else
                subFrame.Height=10;

            this.Frame.SubFrame[i]=subFrame;
        }
    }
}


////////////////////////////////////////////////////////////////////////////////
//  走势图横屏显示
//
function MinuteChartHScreenContainer(uielement)
{
    this.newMethod=MinuteChartContainer;   //派生
    this.newMethod(uielement);
    delete this.newMethod;

    this.ClassName='MinuteChartHScreenContainer';

    this.OnMouseMove=function(x,y,e)
    {
        this.LastPoint.X=x;
        this.LastPoint.Y=y;
        this.CursorIndex=this.Frame.GetXData(y);

        this.DrawDynamicInfo();
    }

     //创建
    //windowCount 窗口个数
    this.Create=function(windowCount)
    {
        this.UIElement.JSChartContainer=this;

        //创建十字光标
        this.ChartCorssCursor=new ChartCorssCursor();
        this.ChartCorssCursor.Canvas=this.Canvas;
        this.ChartCorssCursor.StringFormatX=new HQMinuteTimeStringFormat();
        this.ChartCorssCursor.StringFormatY=new HQPriceStringFormat();

        //创建框架容器
        this.Frame=new HQTradeHScreenFrame();
        this.Frame.ChartBorder=new ChartBorder();
        this.Frame.ChartBorder.UIElement=this.UIElement;
        this.Frame.ChartBorder.Top=25;
        this.Frame.ChartBorder.Left=50;
        this.Frame.ChartBorder.Bottom=20;
        this.Frame.Canvas=this.Canvas;
        this.ChartCorssCursor.Frame=this.Frame; //十字光标绑定框架

        this.CreateChildWindow(windowCount);
        this.CreateMainKLine();

        //子窗口动态标题
        for(var i in this.Frame.SubFrame)
        {
            var titlePaint=new DynamicChartTitlePainting();
            titlePaint.Frame=this.Frame.SubFrame[i].Frame;
            titlePaint.Canvas=this.Canvas;

            this.TitlePaint.push(titlePaint);
        }
        
        this.ChartCorssCursor.StringFormatX.Frame=this.Frame.SubFrame[0].Frame;

        this.UIElement.addEventListener("keydown", OnKeyDown, true);    //键盘消息
    }

    //创建子窗口
    this.CreateChildWindow=function(windowCount)
    {
        for(var i=0;i<windowCount;++i)
        {
            var border=new ChartBorder();
            border.UIElement=this.UIElement;

            var frame=new MinuteHScreenFrame();
            frame.Canvas=this.Canvas;
            frame.ChartBorder=border;
            if (i<2) frame.ChartBorder.TitleHeight=0;
            frame.XPointCount=243;

            var DEFAULT_HORIZONTAL=[9,8,7,6,5,4,3,2,1];
            frame.HorizontalMax=DEFAULT_HORIZONTAL[0];
            frame.HorizontalMin=DEFAULT_HORIZONTAL[DEFAULT_HORIZONTAL.length-1];

            if (i==0)
            {
                frame.YSplitOperator=new FrameSplitMinutePriceY();
                frame.YSplitOperator.FrameSplitData=this.FrameSplitData.get('price');
            }
            else
            {
                frame.YSplitOperator=new FrameSplitY();
                frame.YSplitOperator.FrameSplitData=this.FrameSplitData.get('double');
            }

            frame.YSplitOperator.Frame=frame;
            frame.YSplitOperator.ChartBorder=border;
            frame.XSplitOperator=new FrameSplitMinuteX();
            frame.XSplitOperator.Frame=frame;
            frame.XSplitOperator.ChartBorder=border;
            if (i!=windowCount-1) frame.XSplitOperator.ShowText=false;
            frame.XSplitOperator.Operator();

            for(var j in DEFAULT_HORIZONTAL)
            {
                frame.HorizontalInfo[j]= new CoordinateInfo();
                frame.HorizontalInfo[j].Value=DEFAULT_HORIZONTAL[j];
                if (i==0 && j==frame.HorizontalMin) continue;

                frame.HorizontalInfo[j].Message[1]=DEFAULT_HORIZONTAL[j].toString();
                frame.HorizontalInfo[j].Font="14px 微软雅黑";
            }

            var subFrame=new SubFrameItem();
            subFrame.Frame=frame;
            if (i==0)
                subFrame.Height=20;
            else
                subFrame.Height=10;

            this.Frame.SubFrame[i]=subFrame;
        }
    }

}


////////////////////////////////////////////////////////////////////////////////
//  简单的图形框架
//
function SimlpleChartContainer(uielement)
{
    this.newMethod=JSChartContainer;   //派生
    this.newMethod(uielement);
    delete this.newMethod;

    this.MainDataControl;    //主数据类(对外的接口类)
    //this.SubDataControl=new Array();

    //创建
    this.Create=function()
    {
        this.UIElement.JSChartContainer=this;

        //创建十字光标
        //this.ChartCorssCursor=new ChartCorssCursor();
        //this.ChartCorssCursor.Canvas=this.Canvas;
        //this.ChartCorssCursor.StringFormatX=new HQDateStringFormat();
        //this.ChartCorssCursor.StringFormatY=new HQPriceStringFormat();

        //创建等待提示
        this.ChartSplashPaint = new ChartSplashPaint();
        this.ChartSplashPaint.Canvas = this.Canvas;

        //创建框架容器
        this.Frame=new SimpleChartFrame();
        this.Frame.ChartBorder=new ChartBorder();
        this.Frame.ChartBorder.UIElement=this.UIElement;
        this.Frame.ChartBorder.Top=30;
        this.Frame.ChartBorder.Left=5;
        this.Frame.ChartBorder.Bottom=20;
        this.Frame.Canvas=this.Canvas;
        if (this.ChartCorssCursor) this.ChartCorssCursor.Frame=this.Frame; //十字光标绑定框架
        this.ChartSplashPaint.Frame = this.Frame;

        this.CreateMainChart();

        this.UIElement.addEventListener("keydown", OnKeyDown, true);    //键盘消息
    }

    this.SetMainDataConotrl=function(dataControl)
    {
        if (!dataControl) return;

        this.MainDataControl=dataControl;
        this.ChartPaint=[]; //图形

        this.CreateMainChart();
        this.Draw();
        this.RequestData();
    }

    //创建主数据画法
    this.CreateMainChart=function()
    {
        if (!this.MainDataControl) return;

        for(let i in this.MainDataControl.DataType)
        {
           let item=this.MainDataControl.DataType[i];
           if (item.Type=="BAR")
           {
               var chartItem=new ChartBar();
               chartItem.Canvas=this.Canvas;
               chartItem.ChartBorder=this.Frame.ChartBorder;
               chartItem.ChartFrame=this.Frame;
               chartItem.Name=item.Name;
               if (item.Color) chartItem.UpBarColor=item.Color;
               if (item.Color2) chartItem.DownBarColor=item.Color2;

               this.ChartPaint.push(chartItem);
           }
           else if (item.Type=="LINE")
           {
                var chartItem=new ChartLine();
                chartItem.Canvas=this.Canvas;
                chartItem.ChartBorder=this.Frame.ChartBorder;
                chartItem.ChartFrame=this.Frame;
                chartItem.Name=item.Name;
                if (item.Color) chartItem.Color=item.Color;

                this.ChartPaint.push(chartItem);
           }
        }

        this.Frame.YSplitOperator=new FrameSplitY();
        this.Frame.YSplitOperator.FrameSplitData=this.FrameSplitData.get('double');
        this.Frame.YSplitOperator.Frame=this.Frame;
        this.Frame.YSplitOperator.ChartBorder=this.Frame.ChartBorder;

        this.Frame.XSplitOperator=new FrameSplitXData();
        this.Frame.XSplitOperator.Frame=this.Frame;
        this.Frame.XSplitOperator.ChartBorder=this.Frame.ChartBorder;


       // this.TitlePaint[0]=new DynamicKLineTitlePainting();
       // this.TitlePaint[0].Frame=this.Frame.SubFrame[0].Frame;
       // this.TitlePaint[0].Canvas=this.Canvas;
    }

    this.RequestData=function()
    {
        if(!this.MainDataControl) return;

        this.MainDataControl.JSChartContainer=this;
        this.MainDataControl.RequestData();
    }

    this.UpdateMainData=function(dataControl)
    {   

        let lCount=0;
        for(let i in dataControl.Data)
        {
            let itemData=new ChartData();
            itemData.Data=dataControl.Data[i];
            this.ChartPaint[i].Data=itemData;
            if (lCount<itemData.Data.length) lCount=itemData.Data.length;
        }

        this.Frame.XPointCount=lCount;
        this.Frame.Data=this.ChartPaint[0].Data;
        this.Frame.XData=dataControl.XData;

        this.UpdateFrameMaxMin();               //调整坐标最大 最小值
        this.Frame.SetSizeChage(true);
        this.Draw();
    }

}

////////////////////////////////////////////////////////////////////////////////
//  饼图图形框架
//
function PieChartContainer(uielement)
{
    this.Radius;    //半径
    this.newMethod=JSChartContainer;   //派生
    this.newMethod(uielement);
    delete this.newMethod;

    this.MainDataControl;    //主数据类(对外的接口类)

    //鼠标移动
    this.OnMouseMove=function(x,y,e)
    {

    }

    //创建
    this.Create=function()
    {
        this.UIElement.JSChartContainer=this;

        //创建等待提示
        this.ChartSplashPaint = new ChartSplashPaint();
        this.ChartSplashPaint.Canvas = this.Canvas;

        //创建框架容器
        this.Frame=new NoneFrame();
        this.Frame.ChartBorder=new ChartBorder();
        this.Frame.ChartBorder.UIElement=this.UIElement;
        this.Frame.ChartBorder.Top=30;
        this.Frame.ChartBorder.Left=5;
        this.Frame.ChartBorder.Bottom=20;
        this.Frame.Canvas=this.Canvas;

        this.ChartSplashPaint.Frame = this.Frame;
        this.CreateMainChart();
    }

    this.SetMainDataConotrl=function(dataControl)
    {
        if (!dataControl) return;

        this.MainDataControl=dataControl;
        this.ChartPaint=[]; //图形

        this.CreateMainChart();
        this.Draw();
        this.RequestData();
    }

    //创建主数据画法
    this.CreateMainChart=function()
    {
        if (!this.MainDataControl) return;

        for(let i in this.MainDataControl.DataType)
        {
           let item=this.MainDataControl.DataType[i];
           if (item.Type=="PIE")    //饼图
           {

               var chartItem=new ChartPie();
               chartItem.Canvas=this.Canvas;
               chartItem.ChartBorder=this.Frame.ChartBorder;
               chartItem.ChartFrame=this.Frame;
               chartItem.Name=item.Name;

               if(this.Radius) chartItem.Radius = this.Radius;

               this.ChartPaint.push(chartItem);
           }
           else if (item.Type=='RADAR') //雷达图
           {
                var chartItem=new ChartRadar();
                chartItem.Canvas=this.Canvas;
                chartItem.ChartBorder=this.Frame.ChartBorder;
                chartItem.ChartFrame=this.Frame;
                chartItem.Name=item.Name;
                if (item.StartAngle) chartItem.StartAngle=item.StartAngle;
                this.ChartPaint.push(chartItem);
           }
        }

       // this.TitlePaint[0]=new DynamicKLineTitlePainting();
       // this.TitlePaint[0].Frame=this.Frame.SubFrame[0].Frame;
       // this.TitlePaint[0].Canvas=this.Canvas;
    }

    this.RequestData=function()
    {
        if(!this.MainDataControl) return;

        this.MainDataControl.JSChartContainer=this;
        this.MainDataControl.RequestData();
    }

    this.UpdateMainData=function(dataControl)
    {
        for(let i in dataControl.Data)
        {
            let itemData=new ChartData();
            itemData.Data=dataControl.Data[i];
            this.ChartPaint[i].Data=itemData;
        }
        this.Frame.SetSizeChage(true);
        this.Draw();
    }

}

//地图
function MapChartContainer(uielement)
{
    this.newMethod=JSChartContainer;   //派生
    this.newMethod(uielement);
    delete this.newMethod;

    this.MainDataControl;    //主数据类(对外的接口类)

    //鼠标移动
    this.OnMouseMove=function(x,y,e)
    {

    }

    //创建
    this.Create=function()
    {
        this.UIElement.JSChartContainer=this;

        //创建等待提示
        this.ChartSplashPaint = new ChartSplashPaint();
        this.ChartSplashPaint.Canvas = this.Canvas;

        //创建框架容器
        this.Frame=new NoneFrame();
        this.Frame.ChartBorder=new ChartBorder();
        this.Frame.ChartBorder.UIElement=this.UIElement;
        this.Frame.ChartBorder.Top=30;
        this.Frame.ChartBorder.Left=5;
        this.Frame.ChartBorder.Bottom=20;
        this.Frame.Canvas=this.Canvas;

        this.ChartSplashPaint.Frame = this.Frame;
        this.CreateMainChart();
    }

    this.SetMainDataConotrl=function(dataControl)
    {
        if (!dataControl) return;

        this.MainDataControl=dataControl;
        this.ChartPaint=[]; //图形

        this.CreateMainChart();
        this.Draw();
        this.RequestData();
    }

    //创建主数据画法
    this.CreateMainChart=function()
    {
        if (!this.MainDataControl) return;

        let chartItem=new ChartChinaMap();
        chartItem.Canvas=this.Canvas;
        chartItem.ChartBorder=this.Frame.ChartBorder;
        chartItem.ChartFrame=this.Frame;
        chartItem.Name=this.MainDataControl.DataType[0].Name;

        if(this.Radius) chartItem.Radius = this.Radius;

        this.ChartPaint.push(chartItem);
           
       // this.TitlePaint[0]=new DynamicKLineTitlePainting();
       // this.TitlePaint[0].Frame=this.Frame.SubFrame[0].Frame;
       // this.TitlePaint[0].Canvas=this.Canvas;
    }

    this.RequestData=function()
    {
        if(!this.MainDataControl) return;

        this.MainDataControl.JSChartContainer=this;
        this.MainDataControl.RequestData();
    }

    this.UpdateMainData=function(dataControl)
    {
        this.ChartPaint[0].Data=dataControl.Data[0];

        this.Frame.SetSizeChage(true);
        this.Draw();
    }
}




//////////////////////////////////////////////////////////
//
//  指标信息
//
function IndexInfo(name,param)
{
    this.Name=name;                 //名字
    this.Param=param;               //参数
    this.LineColor;                 //线段颜色
    this.ReqeustData=null;          //数据请求
}

function BaseIndex(name)
{
    this.Index;         //指标阐述
    this.Name=name;     //指标名字
    this.Script=null;   //通达信脚本

    //默认创建都是线段
    this.Create=function(hqChart,windowIndex)
    {
        for(var i in this.Index)
        {
            if (!this.Index[i].Name) continue;

            var maLine=new ChartLine();
            maLine.Canvas=hqChart.Canvas;
            maLine.Name=this.Name+'-'+i.toString();
            maLine.ChartBorder=hqChart.Frame.SubFrame[windowIndex].Frame.ChartBorder;
            maLine.ChartFrame=hqChart.Frame.SubFrame[windowIndex].Frame;
            maLine.Color=this.Index[i].LineColor;

            hqChart.ChartPaint.push(maLine);
        }
    }

    //指标不支持 周期/复权/股票等
    this.NotSupport=function(hqChart,windowIndex,message)
    {
        var paint=hqChart.GetChartPaint(windowIndex);
        for(var i in paint)
        {
            paint[i].Data.Data=[];    //清空数据
            if (i==0) paint[i].NotSupportMessage=message;
        }
    }

    //格式化指标名字+参数
    //格式:指标名(参数1,参数2,参数3,...)
    this.FormatIndexTitle=function()
    {
        var title=this.Name;
        var param=null;

        for(var i in this.Index)
        {
            var item = this.Index[i];
            if (item.Param==null) continue;

            if (param)
                param+=','+item.Param.toString();
            else
                param=item.Param.toString();
        }

        if (param)
        {
            title+='('+param+')';
        }

        return title;
    }
}

//市场多空
function MarketLongShortIndex()
{
    this.newMethod=BaseIndex;   //派生
    this.newMethod('Long-Short');
    delete this.newMethod;

    this.Index=new Array(
        new IndexInfo("市场多空指标",null),
        new IndexInfo("多头区域",null),
        new IndexInfo("空头区域",null)
    );

    this.Index[0].LineColor=g_JSChartResource.Index.LineColor[0];
    this.Index[1].LineColor=g_JSChartResource.UpBarColor;
    this.Index[2].LineColor=g_JSChartResource.DownBarColor;

    this.LongShortData; //多空数据

    this.Create=function(hqChart,windowIndex)
    {
        for(var i in this.Index)
        {
            var paint=null;
            if (i==0)
                paint=new ChartLine();
            else
                paint=new ChartStraightLine();

            paint.Color=this.Index[i].LineColor;
            paint.Canvas=hqChart.Canvas;
            paint.Name=this.Name+"-"+i.toString();
            paint.ChartBorder=hqChart.Frame.SubFrame[windowIndex].Frame.ChartBorder;
            paint.ChartFrame=hqChart.Frame.SubFrame[windowIndex].Frame;

            hqChart.ChartPaint.push(paint);
        }
    }

    //请求数据
    this.RequestData=function(hqChart,windowIndex,hisData)
    {
        var self = this;
        var param=
        {
            HQChart:hqChart,
            WindowIndex:windowIndex,
            HistoryData:hisData
        };

        this.LongShortData=[];

        if (param.HQChart.Period>0)   //周期数据
        {
            this.NotSupport(param.HQChart,param.WindowIndex,"不支持周期切换");
            param.HQChart.Draw();
            return false;
        }

        //请求数据
        $.ajax({
            url: g_JSChartResource.Index.MarketLongShortApiUrl,
            data:
            {

            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (recvData)
            {
                self.RecvData(recvData,param);
            }
        });

        return true;
    }

    this.RecvData=function(recvData,param)
    {
        if (recvData.data.length<=0) return;

        var aryData=new Array();
        for(var i in recvData.data)
        {
            var item=recvData.data[i];
            var indexData=new SingleData();
            indexData.Date=item[0];
            indexData.Value=item[1];
            aryData.push(indexData);
        }

        var aryFittingData=param.HistoryData.GetFittingData(aryData);

        var bindData=new ChartData();
        bindData.Data=aryFittingData;
        bindData.Period=param.HQChart.Period;   //周期
        bindData.Right=param.HQChart.Right;     //复权

        this.LongShortData=bindData.GetValue();
        this.BindData(param.HQChart,param.WindowIndex,param.HistoryData);

        param.HQChart.UpdataDataoffset();           //更新数据偏移
        param.HQChart.UpdateFrameMaxMin();          //调整坐标最大 最小值
        param.HQChart.Draw();
    }


    this.BindData=function(hqChart,windowIndex,hisData)
    {
        var paint=hqChart.GetChartPaint(windowIndex);

        if (paint.length!=this.Index.length) return false;

        //paint[0].Data.Data=SWLData;
        paint[0].Data.Data=this.LongShortData;
        paint[0].NotSupportMessage=null;
        paint[1].Data.Data[0]=8;
        paint[2].Data.Data[0]=1;

        //指定[0,9]
        hqChart.Frame.SubFrame[windowIndex].Frame.YSpecificMaxMin={Max:9,Min:0,Count:3};

        var titleIndex=windowIndex+1;

        for(var i in paint)
        {
            hqChart.TitlePaint[titleIndex].Data[i]=new DynamicTitleData(paint[i].Data,this.Index[i].Name,this.Index[i].LineColor);
            if (i>0) hqChart.TitlePaint[titleIndex].Data[i].DataType="StraightLine";
        }

        return true;
    }

}

//市场择时
function MarketTimingIndex()
{
    this.newMethod=BaseIndex;   //派生
    this.newMethod('Market-Timing');
    delete this.newMethod;

    this.Index=new Array(
        new IndexInfo("因子择时",null)
    );

    this.TimingData; //择时数据
    this.TitleColor=g_JSChartResource.FrameSplitTextColor

    this.Create=function(hqChart,windowIndex)
    {
        for(var i in this.Index)
        {
            var paint=new ChartMACD();
            paint.Canvas=hqChart.Canvas;
            paint.Name=this.Name+"-"+i.toString();
            paint.ChartBorder=hqChart.Frame.SubFrame[windowIndex].Frame.ChartBorder;
            paint.ChartFrame=hqChart.Frame.SubFrame[windowIndex].Frame;

            hqChart.ChartPaint.push(paint);
        }
    }

    //请求数据
    this.RequestData=function(hqChart,windowIndex,hisData)
    {
        var self = this;
        var param=
        {
            HQChart:hqChart,
            WindowIndex:windowIndex,
            HistoryData:hisData
        };

        this.LongShortData=[];

        if (param.HQChart.Period>0)   //周期数据
        {
            this.NotSupport(param.HQChart,param.WindowIndex,"不支持周期切换");
            param.HQChart.Draw();
            return false;
        }

        //请求数据
        $.ajax({
            url: g_JSChartResource.Index.MarketLongShortApiUrl,
            data:
            {

            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (recvData)
            {
                self.RecvData(recvData,param);
            }
        });

        return true;
    }

    this.RecvData=function(recvData,param)
    {
        if (recvData.data.length<=0) return;

        var aryData=new Array();
        for(var i in recvData.data)
        {
            var item=recvData.data[i];
            var indexData=new SingleData();
            indexData.Date=item[0];
            indexData.Value=item[2];
            aryData.push(indexData);
        }

        var aryFittingData=param.HistoryData.GetFittingData(aryData);

        var bindData=new ChartData();
        bindData.Data=aryFittingData;
        bindData.Period=param.HQChart.Period;   //周期
        bindData.Right=param.HQChart.Right;     //复权

        this.TimingData=bindData.GetValue();
        this.BindData(param.HQChart,param.WindowIndex,param.HistoryData);

        param.HQChart.UpdataDataoffset();           //更新数据偏移
        param.HQChart.UpdateFrameMaxMin();          //调整坐标最大 最小值
        param.HQChart.Draw();
    }


    this.BindData=function(hqChart,windowIndex,hisData)
    {
        var paint=hqChart.GetChartPaint(windowIndex);

        if (paint.length!=this.Index.length) return false;

        //paint[0].Data.Data=SWLData;
        paint[0].Data.Data=this.TimingData;
        paint[0].NotSupportMessage=null;

        var titleIndex=windowIndex+1;

        for(var i in paint)
        {
            hqChart.TitlePaint[titleIndex].Data[i]=new DynamicTitleData(paint[i].Data,this.Index[i].Name,this.TitleColor);
            hqChart.TitlePaint[titleIndex].Data[i].StringFormat=STRING_FORMAT_TYPE.THOUSANDS;
            hqChart.TitlePaint[titleIndex].Data[i].FloatPrecision=0;
        }

        return true;
    }
}

//市场关注度
function MarketAttentionIndex()
{
    this.newMethod=BaseIndex;   //派生
    this.newMethod('Market-Attention');
    delete this.newMethod;

    this.Index=new Array(
        new IndexInfo("市场关注度",null)
    );

    this.Data; //关注度数据
    this.TitleColor=g_JSChartResource.FrameSplitTextColor;
    this.ApiUrl=g_JSChartResource.Index.MarketAttentionApiUrl;

    this.Create=function(hqChart,windowIndex)
    {
        for(var i in this.Index)
        {
            var paint=new ChartMACD();   //柱子
            paint.Canvas=hqChart.Canvas;
            paint.Name=this.Name+"-"+i.toString();
            paint.ChartBorder=hqChart.Frame.SubFrame[windowIndex].Frame.ChartBorder;
            paint.ChartFrame=hqChart.Frame.SubFrame[windowIndex].Frame;

            hqChart.ChartPaint.push(paint);
        }
    }

    //调整框架
    this.SetFrame=function(hqChart,windowIndex,hisData)
    {
        hqChart.Frame.SubFrame[windowIndex].Frame.YSpecificMaxMin={Max:6,Min:0,Count:3};
    }

    //请求数据
    this.RequestData=function(hqChart,windowIndex,hisData)
    {
        var self = this;
        var param=
        {
            HQChart:hqChart,
            WindowIndex:windowIndex,
            HistoryData:hisData
        };

        this.Data=[];

        if (param.HQChart.Period>0)   //周期数据
        {
            this.NotSupport(param.HQChart,param.WindowIndex,"不支持周期切换");
            param.HQChart.Draw();
            return false;
        }

        //请求数据
        $.ajax({
            url: this.ApiUrl,
            data:
            {
               "symbol":param.HQChart.Symbol,
               "startdate":20100101,
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (recvData)
            {
                self.RecvData(recvData,param);
            }
        });

        return true;
    }

    this.RecvData=function(recvData,param)
    {
        if (recvData.date.length<0) return;

        var aryData=new Array();
        for(var i in recvData.date)
        {
            var indexData=new SingleData();
            indexData.Date=recvData.date[i];
            indexData.Value=recvData.value[i];
            aryData.push(indexData);
        }

        var aryFittingData=param.HistoryData.GetFittingData(aryData);

        var bindData=new ChartData();
        bindData.Data=aryFittingData;
        bindData.Period=param.HQChart.Period;   //周期
        bindData.Right=param.HQChart.Right;     //复权

        this.Data=bindData.GetValue();
        this.BindData(param.HQChart,param.WindowIndex,param.HistoryData);
        this.SetFrame(param.HQChart,param.WindowIndex,param.HistoryData);

        param.HQChart.UpdataDataoffset();           //更新数据偏移
        param.HQChart.UpdateFrameMaxMin();          //调整坐标最大 最小值
        param.HQChart.Draw();
    }


    this.BindData=function(hqChart,windowIndex,hisData)
    {
        var paint=hqChart.GetChartPaint(windowIndex);

        if (paint.length!=this.Index.length) return false;

        //paint[0].Data.Data=SWLData;
        paint[0].Data.Data=this.Data;
        paint[0].NotSupportMessage=null;

        var titleIndex=windowIndex+1;

        for(var i in paint)
        {
            hqChart.TitlePaint[titleIndex].Data[i]=new DynamicTitleData(paint[i].Data,this.Index[i].Name,this.TitleColor);
            hqChart.TitlePaint[titleIndex].Data[i].StringFormat=STRING_FORMAT_TYPE.THOUSANDS;
            hqChart.TitlePaint[titleIndex].Data[i].FloatPrecision=0;
        }

        return true;
    }
}


/*
    行业,指数热度
*/
function MarketHeatIndex()
{
    this.newMethod=BaseIndex;   //派生
    this.newMethod('Market-Heat');
    delete this.newMethod;

    this.Index=new Array(
        new IndexInfo("热度",5),
        new IndexInfo('MA',10),
        new IndexInfo('MA',null)
    );

    this.Data; //关注度数据

    this.ApiUrl=g_JSChartResource.Index.MarketHeatApiUrl;

    this.Index[0].LineColor=g_JSChartResource.FrameSplitTextColor;
    this.Index[1].LineColor=g_JSChartResource.Index.LineColor[0];
    this.Index[2].LineColor=g_JSChartResource.Index.LineColor[1];

    this.Create=function(hqChart,windowIndex)
    {
        for(var i in this.Index)
        {
            var paint=null;
            if (i==0) 
            {
                paint=new ChartMACD();   //柱子
            }
            else 
            {
                paint=new ChartLine();
                paint.Color=this.Index[i].LineColor;
            }

            paint.Canvas=hqChart.Canvas;
            paint.Name=this.Name+"-"+i.toString();
            paint.ChartBorder=hqChart.Frame.SubFrame[windowIndex].Frame.ChartBorder;
            paint.ChartFrame=hqChart.Frame.SubFrame[windowIndex].Frame;

            hqChart.ChartPaint.push(paint);
        }
    }

    //请求数据
    this.RequestData=function(hqChart,windowIndex,hisData)
    {
        var self = this;
        var param=
        {
            HQChart:hqChart,
            WindowIndex:windowIndex,
            HistoryData:hisData
        };

        this.Data=[];

        if (param.HQChart.Period>0)   //周期数据
        {
            this.NotSupport(param.HQChart,param.WindowIndex,"不支持周期切换");
            param.HQChart.Draw();
            return false;
        }

        //请求数据
        $.ajax({
            url: this.ApiUrl,
            data:
            {
               "symbol":param.HQChart.Symbol,
               "startdate":20100101,
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (recvData)
            {
                self.RecvData(recvData,param);
            }
        });

        return true;
    }

    this.RecvData=function(recvData,param)
    {
        if (recvData.date.length<0) return;

        var aryData=new Array();
        for(var i in recvData.date)
        {
            var indexData=new SingleData();
            indexData.Date=recvData.date[i];
            indexData.Value=recvData.value[i];
            aryData.push(indexData);
        }

        var aryFittingData=param.HistoryData.GetFittingData(aryData);

        var bindData=new ChartData();
        bindData.Data=aryFittingData;
        bindData.Period=param.HQChart.Period;   //周期
        bindData.Right=param.HQChart.Right;     //复权

        this.Data=bindData.GetValue();
        this.BindData(param.HQChart,param.WindowIndex,param.HistoryData);

        param.HQChart.UpdataDataoffset();           //更新数据偏移
        param.HQChart.UpdateFrameMaxMin();          //调整坐标最大 最小值
        param.HQChart.Draw();
    }


    this.BindData=function(hqChart,windowIndex,hisData)
    {
        var paint=hqChart.GetChartPaint(windowIndex);

        if (paint.length!=this.Index.length) return false;

        paint[0].Data.Data=this.Data;
        paint[0].NotSupportMessage=null;

        var MA=HQIndexFormula.MA(this.Data,this.Index[0].Param);
        paint[1].Data.Data=MA;

        var MA2=HQIndexFormula.MA(this.Data,this.Index[1].Param);
        paint[2].Data.Data=MA2;

        var titleIndex=windowIndex+1;

        for(var i in paint)
        {
            var name="";    //显示的名字特殊处理
            if(i==0)
                name=hqChart.Name+this.Index[i].Name;
            else
                name="MA"+this.Index[i-1].Param;

            hqChart.TitlePaint[titleIndex].Data[i]=new DynamicTitleData(paint[i].Data,name,this.Index[i].LineColor);
            hqChart.TitlePaint[titleIndex].Data[i].StringFormat=STRING_FORMAT_TYPE.DEFAULT;
            hqChart.TitlePaint[titleIndex].Data[i].FloatPrecision=2;
        }

        //hqChart.TitlePaint[titleIndex].Explain="热度说明";

        return true;
    }

}

//自定义指数热度
function CustonIndexHeatIndex()
{
    this.newMethod=BaseIndex;   //派生
    this.newMethod('Market-Heat');
    delete this.newMethod;

    this.Index=new Array(
        new IndexInfo('区域',3),
        new IndexInfo("热度指数",10),
        new IndexInfo('MA',5),
        new IndexInfo('MA',10)
    );

    this.Data; //关注度数据

    this.ApiUrl=g_JSChartResource.Index.CustomIndexHeatApiUrl;

    this.Index[1].LineColor=g_JSChartResource.Index.LineColor[1];
    this.Index[2].LineColor=g_JSChartResource.Index.LineColor[2];
    this.Index[3].LineColor=g_JSChartResource.Index.LineColor[3];

    this.Create=function(hqChart,windowIndex)
    {
        for(var i in this.Index)
        {
            var paint=null;
            if (i==0) 
            {
                paint = new ChartStraightArea();
            }
            else 
            {
                paint=new ChartLine();
                paint.Color=this.Index[i].LineColor;
            }

            paint.Canvas=hqChart.Canvas;
            paint.Name=this.Name+"-"+i.toString();
            paint.ChartBorder=hqChart.Frame.SubFrame[windowIndex].Frame.ChartBorder;
            paint.ChartFrame=hqChart.Frame.SubFrame[windowIndex].Frame;

            hqChart.ChartPaint.push(paint);
        }
    }

    //请求数据
    this.RequestData=function(hqChart,windowIndex,hisData)
    {
        var self = this;
        var param=
        {
            HQChart:hqChart,
            WindowIndex:windowIndex,
            HistoryData:hisData
        };

        this.Data=[];

        if (param.HQChart.Period>0)   //周期数据
        {
            this.NotSupport(param.HQChart,param.WindowIndex,"不支持周期切换");
            param.HQChart.Draw();
            return false;
        }

        //请求数据
        $.ajax({
            url: this.ApiUrl,
            data:
            {
               "stock":param.HQChart.CustomStock,
               "date":{"startdate":param.HQChart.QueryDate.Start,"enddate":param.HQChart.QueryDate.End},
               "day":[this.Index[0].Param,this.Index[1].Param],
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (recvData)
            {
                self.RecvData(recvData,param);
            }
        });

        return true;
    }

    this.RecvData=function(recvData,param)
    {
        if (recvData.data==null || recvData.data.length<0) return;

        //console.log(recvData.data);
        var aryData=new Array();
        for(let i in recvData.data)
        {
            let item=recvData.data[i];
            let indexData=new SingleData();
            indexData.Date=item[0];
            indexData.Value=item[1];
            aryData.push(indexData);
        }

        var aryFittingData=param.HistoryData.GetFittingData(aryData);

        var bindData=new ChartData();
        bindData.Data=aryFittingData;
        bindData.Period=param.HQChart.Period;   //周期
        bindData.Right=param.HQChart.Right;     //复权

        this.Data=bindData.GetValue();
        this.BindData(param.HQChart,param.WindowIndex,param.HistoryData);

        param.HQChart.UpdataDataoffset();           //更新数据偏移
        param.HQChart.UpdateFrameMaxMin();          //调整坐标最大 最小值
        param.HQChart.Draw();
    }


    this.BindData=function(hqChart,windowIndex,hisData)
    {
        let paint=hqChart.GetChartPaint(windowIndex);

        if (paint.length!=this.Index.length) return false;

        paint[0].NotSupportMessage=null;
        paint[0].Data.Data=
        [
          { Value: 0, Value2: 0.2, Color: 'rgb(50,205,50)', Title: '热度1', TitleColor:'rgb(245,255 ,250)'},
          { Value: 0.2, Value2: 0.4, Color: 'rgb(255,140,0)', Title: '热度2', TitleColor:'rgb(245,255 ,250)'},
          { Value: 0.4, Value2: 0.8, Color: 'rgb(255,106,106)', Title: '热度3', TitleColor:'rgb(245,255 ,250)'},
          { Value: 0.8, Value2: 1, Color: 'rgb(208, 32 ,144)', Title: '热度4', TitleColor:'rgb(245,255 ,250)'}
        ];
        
        paint[1].Data.Data = this.Data;
        
        let MA=HQIndexFormula.MA(this.Data,this.Index[2].Param);
        paint[2].Data.Data=MA;

        let MA2=HQIndexFormula.MA(this.Data,this.Index[3].Param);
        paint[3].Data.Data=MA2;

         //指定框架最大最小[0,1]
         hqChart.Frame.SubFrame[windowIndex].Frame.YSpecificMaxMin = { Max: 1, Min: 0, Count: 3 };

        let titleIndex=windowIndex+1;

        for(let i=1;i<paint.length;++i)
        {
            let name=this.Index[i].Name;    //显示的名字特殊处理
            if (name=='MA') name="MA"+this.Index[i].Param;

            hqChart.TitlePaint[titleIndex].Data[i]=new DynamicTitleData(paint[i].Data,name,this.Index[i].LineColor);
            hqChart.TitlePaint[titleIndex].Data[i].StringFormat=STRING_FORMAT_TYPE.DEFAULT;
            hqChart.TitlePaint[titleIndex].Data[i].FloatPrecision=2;
        }

        hqChart.TitlePaint[titleIndex].Title='热度'+'('+this.Index[0].Param+','+this.Index[1].Param+','+this.Index[2].Param+','+this.Index[3].Param+')';

        return true;
    }

}


/*
    本福特系数(财务粉饰)
*/
function BenfordIndex()
{
    this.newMethod=BaseIndex;   //派生
    this.newMethod('财务粉饰');
    delete this.newMethod;

    this.Index = new Array(
        new IndexInfo('区域', null),
        new IndexInfo("系数", null),
      );

    this.Data; //财务数据

    this.ApiUrl=g_JSChartResource.Index.StockHistoryDayApiUrl;

    this.Index[0].LineColor=g_JSChartResource.Index.LineColor[0];
    this.Index[1].LineColor='rgb(105,105,105)';

    this.Create=function(hqChart,windowIndex)
    {
        for (var i in this.Index) 
        {
            var paint = null;
            if (i == 0)
                paint = new ChartStraightArea();
            else if (i==1)
                paint = new ChartLineMultiData();

            if (paint)
            {
                paint.Color = this.Index[i].LineColor;
                paint.Canvas = hqChart.Canvas;
                paint.Name = this.Name + "-" + i.toString();
                paint.ChartBorder = hqChart.Frame.SubFrame[windowIndex].Frame.ChartBorder;
                paint.ChartFrame = hqChart.Frame.SubFrame[windowIndex].Frame;

                hqChart.ChartPaint.push(paint);
            }
        }
    }

    //请求数据
    this.RequestData=function(hqChart,windowIndex,hisData)
    {
        var self = this;
        var param=
        {
            HQChart:hqChart,
            WindowIndex:windowIndex,
            HistoryData:hisData
        };

        this.Data=[];

        if (param.HQChart.Period!=2)   //周期数据
        {
            this.NotSupport(param.HQChart,param.WindowIndex,"只支持月线");
            param.HQChart.Draw();
            return false;
        }

        var aryField=["finance.benford","announcement2.quarter","announcement1.quarter","announcement3.quarter","announcement4.quarter"];
        var aryCondition=
            [  
                {item:["date","int32","gte","20130101"]},
                {item:[ "announcement1.year","int32","gte",0,
                        "announcement2.year","int32","gte",0,
                        "announcement3.year","int32","gte",0,
                        "announcement4.year","int32","gte",0,
                        "or"]}
            ];
        //请求数据
        $.ajax({
            url: this.ApiUrl,
            data:
            {
               "symbol":[param.HQChart.Symbol],
               "field":aryField,
               "condition":aryCondition
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (recvData)
            {
                self.RecvData(recvData,param);
            }
        });

        return true;
    }

    this.JsonDataToMapSingleData=function(recvData)
    {
        var stockData=recvData.stock[0].stockday;
        var mapData=new Map();
        for(var i in stockData)
        {
            var item=stockData[i];
            var indexData=new SingleData();
            indexData.Date=item.date;
            indexData.Value=new Array();
            if (item.finance1!=null && item.announcement1!=null)
            {
                let year=item.announcement1.year;
                let quarter=item.announcement1.quarter;
                let value=item.finance1.benford;
                indexData.Value.push({Year:year,Quarter:quarter,Value:value});
            }
            if (item.finance2!=null && item.announcement2!=null)
            {
                let year=item.announcement2.year;
                let quarter=item.announcement2.quarter;
                let value=item.finance2.benford;
                indexData.Value.push({Year:year,Quarter:quarter,Value:value});
            }
            if (item.finance3!=null && item.announcement3!=null)
            {
                let year=item.announcement3.year;
                let quarter=item.announcement3.quarter;
                let value=item.finance3.benford;
                indexData.Value.push({Year:year,Quarter:quarter,Value:value});
            }
            if (item.finance4!=null && item.announcement4!=null)
            {
                let year=item.announcement4.year;
                let quarter=item.announcement4.quarter;
                let value=item.finance4.benford;
                indexData.Value.push({Year:year,Quarter:quarter,Value:value});
            }

            mapData.set(indexData.Date,indexData);
        }

        var aryData=new Array();
        for( var item of mapData)
        {
            aryData.push(item[1]);
        }

        return aryData;
    }

    this.RecvData=function(recvData,param)
    {
        console.log(recvData);
        if (recvData.stock==null || recvData.stock.length<=0) return;

        var aryData=this.JsonDataToMapSingleData(recvData);

        var aryFittingData=param.HistoryData.GetFittingMonthData(aryData);

        var bindData=new ChartData();
        bindData.Data=aryFittingData;
        bindData.Period=param.HQChart.Period;   //周期
        bindData.Right=param.HQChart.Right;     //复权

        this.Data=bindData.GetValue();
        this.BindData(param.HQChart,param.WindowIndex,param.HistoryData);

        param.HQChart.UpdataDataoffset();           //更新数据偏移
        param.HQChart.UpdateFrameMaxMin();          //调整坐标最大 最小值
        param.HQChart.Draw();
    }


    this.BindData=function(hqChart,windowIndex,hisData)
    {
        var paint=hqChart.GetChartPaint(windowIndex);

        if (paint.length!=this.Index.length) return false;

        paint[0].NotSupportMessage = null;

        paint[0].Data.Data=
        [
          { Value: 0, Value2: 0.2, Color: 'rgb(50,205,50)', Title: '安全区', TitleColor:'rgb(245,255 ,250)'},
          { Value: 0.2, Value2: 0.4, Color: 'rgb(255,140,0)', Title: '预警区', TitleColor:'rgb(245,255 ,250)'},
          { Value: 0.4, Value2: 1, Color: 'rgb(255,106,106)', Title: '警示区', TitleColor:'rgb(245,255 ,250)'}
        ];
        
        paint[1].Data.Data = this.Data;
        
        //指定框架最大最小[0,1]
        hqChart.Frame.SubFrame[windowIndex].Frame.YSpecificMaxMin = { Max: 1, Min: 0, Count: 3 };
    
        var titleIndex = windowIndex + 1;
    
        hqChart.TitlePaint[titleIndex].Data[1] = new DynamicTitleData(paint[1].Data, this.Index[1].Name, this.Index[1].LineColor);
        hqChart.TitlePaint[titleIndex].Data[1].DataType = "MultiReport";
         
        hqChart.TitlePaint[titleIndex].Title = this.FormatIndexTitle();

        return true;
    }
}



///////////////////////////////////////////////////////////////////////
//  能图指标
//

/*
    大盘趋势函数
    个股趋势函数

    上线:=SMA(C,6.5,1);
    下线:=SMA(C,13.5,1);
    STICKLINE(上线>下线 , 上线,下线 ,2, 0),COLORRED,LINETHICK2;
    STICKLINE(下线>上线,上线,下线,2,0),COLORBLUE,LINETHICK2;
*/

function LighterIndex1()
{
    this.newMethod=BaseIndex;   //派生
    this.newMethod('Lighter-Trend');
    delete this.newMethod;

    this.Index=new Array(
        new IndexInfo("STICKLINE",null),
        new IndexInfo('STICKLINE',null)
    );

    this.Index[0].LineColor='rgb(255,0,0)';
    this.Index[1].LineColor='rgb(0,0,255)';

    this.Create=function(hqChart,windowIndex)
    {
        for(var i in this.Index)
        {
            var paint=new ChartStickLine();
            paint.Canvas=hqChart.Canvas;
            paint.Name=this.Name;
            paint.Name=this.Name+'-'+i.toString();
            paint.Color=this.Index[i].LineColor;
            paint.LineWidth=2;
            paint.ChartBorder=hqChart.Frame.SubFrame[windowIndex].Frame.ChartBorder;
            paint.ChartFrame=hqChart.Frame.SubFrame[windowIndex].Frame;
            hqChart.ChartPaint.push(paint);
        }
    }

    this.BindData=function(hqChart,windowIndex,hisData)
    {
        var paint=hqChart.GetChartPaint(windowIndex);

        if (paint.length!=2) return false;

        var closeData=hisData.GetClose();
        var upData=HQIndexFormula.SMA(closeData,6.5,1);
        var downData=HQIndexFormula.SMA(closeData,13.5,1);

        var stickLine=HQIndexFormula.STICKLINE(HQIndexFormula.ARRAY_GT(upData,downData),upData,downData);;
        var stickLine2=HQIndexFormula.STICKLINE(HQIndexFormula.ARRAY_GT(downData,upData),upData,downData);;

        paint[0].Data.Data=stickLine;
        paint[1].Data.Data=stickLine2;

        var titleIndex=windowIndex+1;
        hqChart.TitlePaint[titleIndex].Title="大盘/个股 趋势函数";

        return true;
    }
}

/*
    位置研判函数
    N:=34;M:=3;
    28,COLORFFFFFF;
    STICKLINE(C>0,0,2,5,0),COLOR00008A;
    STICKLINE(C>0,2,5,5,0),COLOR85008A;
    STICKLINE(C>0,5,10,5,0),COLOR657600;
    STICKLINE(C>0,10,21.5,5,0),COLOR690079;
    STICKLINE(C>0,21.5,23,5,0),COLOR79B715;
    STICKLINE(C>0,23,28,5,0),COLOR00008A;
    VAR1:=EMA(100*(CLOSE-LLV(LOW,N))/(HHV(HIGH,N)-LLV(LOW,N)),M)/4,COLORFFFF00,LINETHICK2;

    财貌双拳:VAR1,COLORFFFF00,LINETHICK2;
    DRAWTEXT(CURRBARSCOUNT=128,1,'底部区域'),COLOR00FFFF;
    DRAWTEXT(CURRBARSCOUNT=128,3.5,'介入区域'),COLOR00FFFF;
    DRAWTEXT(CURRBARSCOUNT=128,7.5,'稳健区域'),COLOR00FFFF;
    DRAWTEXT(CURRBARSCOUNT=128,16,'高位区域'),COLOR00FFFF;
    DRAWTEXT(CURRBARSCOUNT=128,22,'风险区域'),COLOR0000FF;
    DRAWTEXT(CURRBARSCOUNT=128,25.5,'顶部区域'),COLORFF00FF;
*/

function LighterIndex2()
{
    this.newMethod=BaseIndex;   //派生
    this.newMethod('位置研判函数');
    delete this.newMethod;

    this.Index=new Array(
        new IndexInfo("STICKLINE",34),
        new IndexInfo('STICKLINE',3),
        new IndexInfo('STICKLINE',null),
        new IndexInfo('STICKLINE',null),
        new IndexInfo('STICKLINE',null),
        new IndexInfo('STICKLINE',null),
        new IndexInfo('LINE',null),
        new IndexInfo('TEXT',null)
    );

    this.Index[0].LineColor='rgb(0,0,138)';
    this.Index[1].LineColor='rgb(133,0,138)';
    this.Index[2].LineColor='rgb(101,118,0)';
    this.Index[3].LineColor='rgb(105,0,121)';
    this.Index[4].LineColor='rgb(121,183,21)';
    this.Index[5].LineColor='rgb(0,0,138)';
    this.Index[6].LineColor='rgb(255,0,0)';

    this.Create=function(hqChart,windowIndex)
    {
        for(var i in this.Index)
        {
            var paint=null;
            if (this.Index[i].Name=='LINE')
            {
                paint=new ChartLine();
                paint.Color=this.Index[i].LineColor;
            }
            else if (this.Index[i].Name=='TEXT')
            {
                paint=new ChartText();
            }
            else
            {
                paint=new ChartStickLine();
                paint.Color=this.Index[i].LineColor;
                paint.LineWidth=5;
            }

            paint.Canvas=hqChart.Canvas;
            paint.Name=this.Name;
            paint.Name=this.Name+'-'+i.toString();
            paint.ChartBorder=hqChart.Frame.SubFrame[windowIndex].Frame.ChartBorder;
            paint.ChartFrame=hqChart.Frame.SubFrame[windowIndex].Frame;
            hqChart.ChartPaint.push(paint);
        }
    }

    this.BindData=function(hqChart,windowIndex,hisData)
    {
        var paint=hqChart.GetChartPaint(windowIndex);

        if (paint.length!=this.Index.length) return false;

        var closeData=hisData.GetClose();
        var highData=hisData.GetHigh();
        var lowData=hisData.GetLow();

        paint[0].Data.Data=HQIndexFormula.STICKLINE(HQIndexFormula.ARRAY_GT(closeData,0),0,2);
        paint[1].Data.Data=HQIndexFormula.STICKLINE(HQIndexFormula.ARRAY_GT(closeData,0),2,5);
        paint[2].Data.Data=HQIndexFormula.STICKLINE(HQIndexFormula.ARRAY_GT(closeData,0),5,10);
        paint[3].Data.Data=HQIndexFormula.STICKLINE(HQIndexFormula.ARRAY_GT(closeData,0),10,21.5);
        paint[4].Data.Data=HQIndexFormula.STICKLINE(HQIndexFormula.ARRAY_GT(closeData,0),21.5,23,5);
        paint[5].Data.Data=HQIndexFormula.STICKLINE(HQIndexFormula.ARRAY_GT(closeData,0),23,28,5);

        //VAR1:=EMA(100*(CLOSE-LLV(LOW,N))/(HHV(HIGH,N)-LLV(LOW,N)),M)/4
        var lineData=HQIndexFormula.ARRAY_DIVIDE(
            HQIndexFormula.EMA(
                HQIndexFormula.ARRAY_MULTIPLY(
                    HQIndexFormula.ARRAY_DIVIDE(
                        HQIndexFormula.ARRAY_SUBTRACT(closeData,HQIndexFormula.LLV(lowData,this.Index[0].Param)),
                        HQIndexFormula.ARRAY_SUBTRACT(HQIndexFormula.HHV(highData,this.Index[0].Param),HQIndexFormula.LLV(lowData,this.Index[0].Param))
                    ),
                    100),
                this.Index[1].Param),
            4
        );

        paint[6].Data.Data=lineData;

        //DRAWTEXT(CURRBARSCOUNT=128,1,'底部区域'),COLOR00FFFF;
        //DRAWTEXT(CURRBARSCOUNT=128,3.5,'介入区域'),COLOR00FFFF;
        //DRAWTEXT(CURRBARSCOUNT=128,7.5,'稳健区域'),COLOR00FFFF;
        //DRAWTEXT(CURRBARSCOUNT=128,16,'高位区域'),COLOR00FFFF;
        //DRAWTEXT(CURRBARSCOUNT=128,22,'风险区域'),COLOR0000FF;
        //DRAWTEXT(CURRBARSCOUNT=128,25.5,'顶部区域'),COLORFF00FF;

        var TextData=new Array();
        TextData[0]={Value:1,   Message:'底部区域',Color:'rgb(0,255,255)',Position:'Left'};
        TextData[1]={Value:3.5, Message:'介入区域',Color:'rgb(0,255,255)',Position:'Left'};
        TextData[2]={Value:7.5, Message:'稳健区域',Color:'rgb(0,255,255)',Position:'Left'};
        TextData[3]={Value:16,  Message:'高位区域',Color:'rgb(0,255,255)',Position:'Left'};
        TextData[4]={Value:22,  Message:'风险区域',Color:'rgb(0,0,255)',Position:'Left'};
        TextData[5]={Value:25.5,Message:'顶部区域',Color:'rgb(255,0,255)',Position:'Left'};

        paint[7].Data.Data=TextData;

        var titleIndex=windowIndex+1;
        hqChart.TitlePaint[titleIndex].Data[0]=new DynamicTitleData(paint[6].Data,"财貌双拳",paint[6].Color);

        hqChart.TitlePaint[titleIndex].Title=this.FormatIndexTitle();

        return true;
    }
}


/*
    py指标 服务器端执行
*/
function PyScriptIndex(name,script,args,option)
{
    this.newMethod=BaseIndex;   //派生
    this.newMethod(name);
    delete this.newMethod;

    this.Script=script; //脚本
    this.Arguments=[];  //参数
    this.OutVar=[];     //输出数据
    this.ApiUrl=g_JSChartResource.PyIndexDomain+'/hq/code';
    if (args) this.Arguments=args;

    this.RequestData=function(hqChart,windowIndex,hisData)
    {
        this.OutVar=[];
        var self = this;
        var param=
        {
            HQChart:hqChart,
            WindowIndex:windowIndex,
            HistoryData:hisData
        };

        //参数
        var strParam='';
        for(let i in this.Arguments)
        {
            if (strParam.length>0) strParam+=',';
            var item=this.Arguments[i];
            strParam+='"'+item.Name+'"'+':'+item.Value;
        }
        strParam='{'+strParam+'}';
        var indexParam=JSON.parse(strParam);

        var data=JSON.stringify(
            {
                code:this.Script,   //脚本
                symbol:param.HQChart.Symbol,    //股票代码
                period:param.HQChart.Period,    //周期 0=日线 1=周线 2=月线 3=年线 4=1分钟 5=5分钟 6=15分钟 7=30分钟 8=60分钟
                right:param.HQChart.Right,      //复权 0 不复权 1 前复权 2 后复权
                params:indexParam,               //指标参数
                numcount:hqChart.MaxReqeustDataCount,
            });

        //请求数据
        $.ajax({
            url: this.ApiUrl,
            data:data,
            type:"post",
            dataType: "json",
            contentType:' application/json; charset=utf-8',
            async:true,
            success: function (recvData)
            {
                self.RecvData(recvData,param);
            },
            complete:function(h)
            {
                //console.log(h);
            },
            error: function(http,e)
            {
                self.RecvError(http,e,param);;
                
            }
        });

        return true;
    }

    this.RecvError=function(http,e,param)
    {
        console.log("[PyScriptIndex::RecvError] error",e);
        if (param.HQChart.ScriptErrorCallback) param.HQChart.ScriptErrorCallback(e);
    }

    this.RecvData=function(recvData,param)
    {
        if (recvData.code!=0) 
        {
            console.log("[PyScriptIndex::RecvData] failed.", recvData);
            if (param.HQChart.ScriptErrorCallback) param.HQChart.ScriptErrorCallback(recvData.msg);
            return;   //失败了
        }

        console.log('[PyScriptIndex::RecvData] recv data.',recvData);
        var aryDate=recvData.date;
        for(var i in recvData.data)
        {
            var item=recvData.data[i];
            var indexData=[];
            for(var j=0;j<aryDate.length && j<aryDate.length;++j)
            {
                if (j>=item.data.length) continue;
                var indexItem=new SingleData(); //单列指标数据
                indexItem.Date=aryDate[j];
                indexItem.Value=item.data[j];
                indexData.push(indexItem);
            }

            var aryFittingData=param.HistoryData.GetFittingData(indexData); //数据和主图K线拟合
            var bindData=new ChartData();
            bindData.Data=aryFittingData;
            bindData.Period=param.HQChart.Period;   //周期
            bindData.Right=param.HQChart.Right;     //复权

            var indexInfo={Name:item.name,Type:item.graph,LineWidth:item.width,Data:bindData.GetValue(),Color:item.color};
            this.OutVar.push(indexInfo);
        }

        this.BindData(param.HQChart,param.WindowIndex,param.HistoryData);   //把数据绑定到图形上

        param.HQChart.UpdataDataoffset();           //更新数据偏移
        param.HQChart.UpdateFrameMaxMin();          //调整坐标最大 最小值
        param.HQChart.Draw();
    }

    this.BindData=function(hqChart,windowIndex,hisData)
    {
        hqChart.DeleteIndexPaint(windowIndex); //清空指标图形

        for(let i in this.OutVar)
        {
            let item=this.OutVar[i];
            switch(item.Type)
            {
                case 'line':
                this.CreateLine(hqChart,windowIndex,item,i);
                break;
                case 'colorstick':  //上下柱子
                this.CreateColorStock(hqChart,windowIndex,item,i);
                break;
            }
        }

        var titleIndex=windowIndex+1;
        hqChart.TitlePaint[titleIndex].Title=this.Name; //这是指标名称

        let indexParam='';  //指标参数
        for(let i in this.Arguments)
        {
            let item=this.Arguments[i];
            if (indexParam.length>0) indexParam+=',';
            indexParam+=item.Value.toString();
        }
        if (indexParam.length>0) hqChart.TitlePaint[titleIndex].Title=this.Name+'('+indexParam+')';

        return true;
    }

    this.CreateLine=function(hqChart,windowIndex,varItem,id)
    {
        let line=new ChartLine();
        line.Canvas=hqChart.Canvas;
        line.DrawType=1;
        line.Name=varItem.Name;
        line.ChartBorder=hqChart.Frame.SubFrame[windowIndex].Frame.ChartBorder;
        line.ChartFrame=hqChart.Frame.SubFrame[windowIndex].Frame;
        if (varItem.Color) line.Color=varItem.Color;
        else line.Color=this.GetDefaultColor(id);

        if (varItem.LineWidth>0) line.LineWidth=varItem.LineWidth;
        if (varItem.IsShow==false) line.IsShow=false;
        
        let titleIndex=windowIndex+1;
        line.Data.Data=varItem.Data;
        hqChart.TitlePaint[titleIndex].Data[id]=new DynamicTitleData(line.Data,varItem.Name,line.Color);

        hqChart.ChartPaint.push(line);
    }

    this.CreateColorStock=function(hqChart,windowIndex,varItem,id)
    {
        let chart=new ChartMACD();
        chart.Canvas=hqChart.Canvas;

        chart.Name=varItem.Name;
        chart.ChartBorder=hqChart.Frame.SubFrame[windowIndex].Frame.ChartBorder;
        chart.ChartFrame=hqChart.Frame.SubFrame[windowIndex].Frame;

        let titleIndex=windowIndex+1;
        chart.Data.Data=varItem.Data;
        hqChart.TitlePaint[titleIndex].Data[id]=new DynamicTitleData(chart.Data,varItem.Name,this.GetDefaultColor(id));

        hqChart.ChartPaint.push(chart);
    }

    //给一个默认的颜色
    this.GetDefaultColor=function(id)
    {
        let COLOR_ARRAY=
        [
            "rgb(255,174,0)",
            "rgb(25,199,255)",
            "rgb(175,95,162)",
            "rgb(236,105,65)",
            "rgb(68,114,196)",
            "rgb(229,0,79)",
            "rgb(0,128,255)",
            "rgb(252,96,154)",
            "rgb(42,230,215)",
            "rgb(24,71,178)",
        ];

        let number=parseInt(id);
        return COLOR_ARRAY[number%(COLOR_ARRAY.length-1)];
    }

}



/*
    json格式数据指标 用来显示本地数据
*/
function JsonDataIndex(name,script,args,option)
{
    this.newMethod=PyScriptIndex;   //派生
    this.newMethod(name);
    delete this.newMethod;

    this.JsonData;  //json格式数据
    if (option.JsonData) this.JsonData=option.JsonData;

    this.RequestData=function(hqChart,windowIndex,hisData)
    {
        if (!this.JsonData)
        {
            console.warn("[PyScriptIndex::RequestData] JsonData is null");
            if (param.HQChart.ScriptErrorCallback) param.HQChart.ScriptErrorCallback('json 数据不能为空');
        }
        else
        {
            var param=
            {
                HQChart:hqChart,
                WindowIndex:windowIndex,
                HistoryData:hisData
            };

            this.JsonData.code=0;
            var recvData=this.JsonData;
            this.RecvData(recvData,param);
        }
    }

}

//给一个默认的颜色
PyScriptIndex.prototype.GetDefaultColor=function(id)
{
    let COLOR_ARRAY=
    [
        "rgb(255,174,0)",
        "rgb(25,199,255)",
        "rgb(175,95,162)",
        "rgb(236,105,65)",
        "rgb(68,114,196)",
        "rgb(229,0,79)",
        "rgb(0,128,255)",
        "rgb(252,96,154)",
        "rgb(42,230,215)",
        "rgb(24,71,178)",
    ];

    let number=parseInt(id);
    return COLOR_ARRAY[number%(COLOR_ARRAY.length-1)];
}


/*
    点位研判函数

    HJ_1:=REF(LOW,1);
    HJ_2:=SMA(ABS(LOW-HJ_1),13,1)/SMA(MAX(LOW-HJ_1,0),13,1)*100;
    HJ_3:=EMA(IF(CLOSE*1.2,HJ_2*13,HJ_2/13),13);
    HJ_4:=LLV(LOW,34);
    HJ_5:=HHV(HJ_3,34);
    HJ_6:=IF(LLV(LOW,56),1,0);
    HJ_7:=EMA(IF(LOW<=HJ_4,(HJ_3+HJ_5*2)/2,0),3)/618*HJ_6;
    HJ_8:=HJ_7>REF(HJ_7,1);
    HJ_9:=REF(LLV(LOW,100),3);
    HJ_10:=REFDATE(HJ_9,DATE);
    HJ_11:=LOW=HJ_10;
    HJ_12:=HJ_8 AND HJ_11;
    HJ_13:=HJ_12>REF(HJ_12,1);
    启动买点:HJ_13>REF(HJ_13,1),COLORRED,LINETHICK1;
*/
function LighterIndex3()
{
    this.newMethod=BaseIndex;   //派生
    this.newMethod('点位研判函数');
    delete this.newMethod;

    this.Index=new Array(
        new IndexInfo("启动买点",null)
    );

    this.Index[0].LineColor='rgb(255,0,0)';

    this.BindData=function(hqChart,windowIndex,hisData)
    {
        var paint=hqChart.GetChartPaint(windowIndex);

        if (paint.length!=this.Index.length) return false;

        var closeData=hisData.GetClose();
        var highData=hisData.GetHigh();
        var lowData=hisData.GetLow();

        //HJ_1:=REF(LOW,1);
        var hj_1=HQIndexFormula.REF(lowData,1);

        //HJ_2:=SMA(ABS(LOW-HJ_1),13,1)/SMA(MAX(LOW-HJ_1,0),13,1)*100;
        var hj_2=HQIndexFormula.ARRAY_MULTIPLY(
            HQIndexFormula.ARRAY_DIVIDE(
                HQIndexFormula.SMA(HQIndexFormula.ABS(HQIndexFormula.ARRAY_SUBTRACT(lowData,hj_1)),13,1),
                HQIndexFormula.SMA(HQIndexFormula.MAX(HQIndexFormula.ARRAY_SUBTRACT(lowData,hj_1),0),13,1)
            ),
            100
        );

        //HJ_3:=EMA(IF(CLOSE*1.2,HJ_2*13,HJ_2/13),13);
        var hj_3=HQIndexFormula.EMA(
            HQIndexFormula.ARRAY_IF(HQIndexFormula.ARRAY_MULTIPLY(closeData,1.2),HQIndexFormula.ARRAY_MULTIPLY(hj_2,13),HQIndexFormula.ARRAY_DIVIDE(hj_2,13)),
            13
        );
        
        //HJ_4:=LLV(LOW,34);
        var hj_4=HQIndexFormula.LLV(lowData,34);

        //HJ_5:=HHV(HJ_3,34);
        var hj_5=HQIndexFormula.HHV(hj_3,34);

        //HJ_6:=IF(LLV(LOW,56),1,0);
        var hj_6=HQIndexFormula.ARRAY_IF(HQIndexFormula.LLV(lowData,56),1,0);

        //HJ_7:=EMA(IF(LOW<=HJ_4,(HJ_3+HJ_5*2)/2,0),3)/618*HJ_6;
        //hj_7_temp=(HJ_3+HJ_5*2)/2,0)  太长了 这部分单独算下
        var hj_7_temp=HQIndexFormula.ARRAY_DIVIDE(HQIndexFormula.ARRAY_ADD(hj_3,HQIndexFormula.ARRAY_MULTIPLY(hj_5,2)),2);

        var hj_7=HQIndexFormula.ARRAY_MULTIPLY(
            HQIndexFormula.ARRAY_DIVIDE(
                HQIndexFormula.EMA(
                    HQIndexFormula.ARRAY_IF(HQIndexFormula.ARRAY_LTE(lowData,hj_4),hj_7_temp,0),
                    3
                ),
                618
            ),
            hj_6
        );

        //HJ_8:=HJ_7>REF(HJ_7,1);
        var hj_8=HQIndexFormula.ARRAY_GT(hj_7,HQIndexFormula.REF(hj_7,1));

        //HJ_9:=REF(LLV(LOW,100),3);
        var hj_9=HQIndexFormula.REF(HQIndexFormula.LLV(lowData,100),3);

        //HJ_10:=REFDATE(HJ_9,DATE); 用当日的数据 产生数组
        var hj_10=HQIndexFormula.REFDATE(hj_9,-1);

        //HJ_11:=LOW=HJ_10;
        var hj_11=HQIndexFormula.ARRAY_EQ(lowData,hj_10);

        //HJ_12:=HJ_8 AND HJ_11;
        var hj_12=HQIndexFormula.ARRAY_AND(hj_8,hj_11);
       
        var buyData=null;
        paint[0].Data.Data=hj_12;

        var titleIndex=windowIndex+1;

        for(var i in paint)
        {
            hqChart.TitlePaint[titleIndex].Data[i]=new DynamicTitleData(paint[i].Data,this.Index[i].Name,this.Index[i].LineColor);
        }

        hqChart.TitlePaint[titleIndex].Title=this.FormatIndexTitle();

        return true;
    }
}


/*
    信息地雷
*/

/*
    信息地雷列表
*/
function JSKLineInfoMap()
{
}

JSKLineInfoMap.Get=function(id)
{
    var infoMap=new Map(
        [
            ["互动易",      {Create:function(){ return new InvestorInfo()}  }],
            ["公告",        {Create:function(){ return new AnnouncementInfo()}  }],
            ["业绩预告",    {Create:function(){ return new PforecastInfo()}  }],
            ["调研",        {Create:function(){ return new ResearchInfo()}  }],
            ["大宗交易",    {Create:function(){ return new BlockTrading()}  }],
            ["龙虎榜",      {Create:function(){ return new TradeDetail()}  }]
        ]
        );

    return infoMap.get(id);
}

JSKLineInfoMap.GetClassInfo=function(id)
{
    var infoMap=new Map(
        [
            ["互动易",      { ClassName:"InvestorInfo" }],
            ["公告",        { ClassName:"AnnouncementInfo" }],
            ["业绩预告",    { ClassName:"PforecastInfo" } ],
            ["调研",        { ClassName:"ResearchInfo"  }],
            ["大宗交易",    { ClassName:"BlockTrading"  }],
            ["龙虎榜",      { ClassName:"TradeDetail"}  ]
        ]
        );

    return infoMap.get(id);
}

JSKLineInfoMap.GetIconUrl=function(type)
{
    switch(type)
    {
        case KLINE_INFO_TYPE.INVESTOR:
            return g_JSChartResource.KLine.Info.Investor.Icon;
            break;
        case KLINE_INFO_TYPE.PFORECAST:
            return g_JSChartResource.KLine.Info.Pforecast.Icon;
        case KLINE_INFO_TYPE.ANNOUNCEMENT:
            return g_JSChartResource.KLine.Info.Announcement.Icon;
        case KLINE_INFO_TYPE.ANNOUNCEMENT_QUARTER_1:
        case KLINE_INFO_TYPE.ANNOUNCEMENT_QUARTER_2:
        case KLINE_INFO_TYPE.ANNOUNCEMENT_QUARTER_3:
        case KLINE_INFO_TYPE.ANNOUNCEMENT_QUARTER_4:
            return g_JSChartResource.KLine.Info.Announcement.IconQuarter;
        case KLINE_INFO_TYPE.RESEARCH:
            return g_JSChartResource.KLine.Info.Research.Icon;
        case KLINE_INFO_TYPE.BLOCKTRADING:
            return g_JSChartResource.KLine.Info.BlockTrading.Icon;
        case KLINE_INFO_TYPE.TRADEDETAIL:
            return g_JSChartResource.KLine.Info.TradeDetail.Icon;
        default:
            return g_JSChartResource.KLine.Info.Announcement.Icon;
    }
}

JSKLineInfoMap.GetIconFont=function(type)
{
    switch(type)
    {
        case KLINE_INFO_TYPE.INVESTOR:
            return g_JSChartResource.KLine.Info.Investor.IconFont;
            break;
        case KLINE_INFO_TYPE.PFORECAST:
            return g_JSChartResource.KLine.Info.Pforecast.IconFont;
        case KLINE_INFO_TYPE.ANNOUNCEMENT:
            return g_JSChartResource.KLine.Info.Announcement.IconFont;
        case KLINE_INFO_TYPE.ANNOUNCEMENT_QUARTER_1:
        case KLINE_INFO_TYPE.ANNOUNCEMENT_QUARTER_2:
        case KLINE_INFO_TYPE.ANNOUNCEMENT_QUARTER_3:
        case KLINE_INFO_TYPE.ANNOUNCEMENT_QUARTER_4:
            return g_JSChartResource.KLine.Info.Announcement.IconFont2;
        case KLINE_INFO_TYPE.RESEARCH:
            return g_JSChartResource.KLine.Info.Research.IconFont;
        case KLINE_INFO_TYPE.BLOCKTRADING:
            return g_JSChartResource.KLine.Info.BlockTrading.IconFont;
        case KLINE_INFO_TYPE.TRADEDETAIL:
            return g_JSChartResource.KLine.Info.TradeDetail.IconFont;
        default:
            return g_JSChartResource.KLine.Info.Announcement.IconFont;
    }
}


function IKLineInfo()
{
    this.MaxReqeustDataCount=1000;
    this.StartDate=20160101;
    this.Data;
    this.ClassName='IKLineInfo';

    this.GetToday=function()
    {
        var date=new Date();
        var today=date.getFullYear()*10000+(date.getMonth()+1)*100+date.getDate();
        return today;
    }
}



//互动易
function InvestorInfo()
{
    this.newMethod=IKLineInfo;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='InvestorInfo';

    this.RequestData=function(hqChart)
    {
        var self = this;
        var param=
        {
            HQChart:hqChart,
        };

        this.Data=[];

        //请求数据
        $.ajax({
            url: g_JSChartResource.KLine.Info.Investor.ApiUrl,
            data:
            {
                "filed": ["question","answerdate","symbol","id"],
                "symbol": [param.HQChart.Symbol],
                "querydate":{"StartDate":this.StartDate,"EndDate":this.GetToday()},
                "start":0,
                "end":this.MaxReqeustDataCount,
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (recvData)
            {
                self.RecvData(recvData,param);
            }
        });

        return true;
    }

    this.RecvData=function(recvData,param)
    {
        if (recvData.list.length<=0) return;

        for(var i in recvData.list)
        {
            var item=recvData.list[i];
            var infoData=new KLineInfoData();
            infoData.Date=item.answerdate;
            infoData.Title=item.question;
            infoData.InfoType=KLINE_INFO_TYPE.INVESTOR;
            this.Data.push(infoData);
        }

        param.HQChart.UpdataChartInfo();
        param.HQChart.Draw();
    }
}


//公告
function AnnouncementInfo()
{
    this.newMethod=IKLineInfo;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='AnnouncementInfo';

    this.RequestData=function(hqChart)
    {
        var self = this;
        var param=
        {
            HQChart:hqChart,
        };

        this.Data=[];

        //请求数据
        $.ajax({
            url: g_JSChartResource.KLine.Info.Announcement.ApiUrl,
            data:
            {
                "filed": ["title","releasedate","symbol","id"],
                "symbol": [param.HQChart.Symbol],
                "querydate":{"StartDate":this.StartDate,"EndDate":this.GetToday()},
                "start":0,
                "end":this.MaxReqeustDataCount,
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (recvData)
            {
                self.RecvData(recvData,param);
            }
        });

        return true;
    }

    this.RecvData=function(recvData,param)
    {
        if (recvData.report.length<=0) return;

        for(var i in recvData.report)
        {
            var item=recvData.report[i];
            var infoData=new KLineInfoData();
            infoData.Date=item.releasedate;
            infoData.Title=item.title;
            infoData.InfoType=KLINE_INFO_TYPE.ANNOUNCEMENT;
            for(var j in item.type)
            {
                var typeItem=item.type[j];
                switch(typeItem)
                {
                    case "一季度报告":
                        infoData.InfoType=KLINE_INFO_TYPE.ANNOUNCEMENT_QUARTER_1;
                        break;
                    case "半年度报告":
                        infoData.InfoType=KLINE_INFO_TYPE.ANNOUNCEMENT_QUARTER_2;
                        break;
                    case "三季度报告":
                        infoData.InfoType=KLINE_INFO_TYPE.ANNOUNCEMENT_QUARTER_3;
                        break;
                    case "年度报告":
                        infoData.InfoType=KLINE_INFO_TYPE.ANNOUNCEMENT_QUARTER_4;
                        break;
                }
            }
            this.Data.push(infoData);
        }

        param.HQChart.UpdataChartInfo();
        param.HQChart.Draw();
    }
}



 //业绩预告
function PforecastInfo()
{
    this.newMethod=IKLineInfo;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='PforecastInfo';

    this.RequestData=function(hqChart)
    {
        var self = this;
        var param=
        {
            HQChart:hqChart,
        };

        this.Data=[];

        //请求数据
        $.ajax({
            url: g_JSChartResource.KLine.Info.Pforecast.ApiUrl,
            data:
            {
                "field": ["pforecast.type","pforecast.reportdate","fweek"],
                "condition":
                [
                    {"item":["pforecast.reportdate","int32","gte",this.StartDate]}
                ],
                "symbol": [param.HQChart.Symbol],
                "start":0,
                "end":this.MaxReqeustDataCount,
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (recvData)
            {
                self.RecvData(recvData,param);
            }
        });

        return true;
    }

    this.RecvData=function(recvData,param)
    {
        if (recvData.stock.length!=1) return;
        if (recvData.stock[0].stockday.length<=0) return;

        for(var i in recvData.stock[0].stockday)
        {
            var item=recvData.stock[0].stockday[i];
            if (item.pforecast.length>0)
            {
                var dataItem=item.pforecast[0];
                var infoData=new KLineInfoData();
                infoData.Date= item.date;
                infoData.Title=dataItem.type;
                infoData.InfoType=KLINE_INFO_TYPE.PFORECAST;
                infoData.ExtendData={ Type:dataItem.type, ReportDate:dataItem.reportdate}
                if(item.fweek)  //未来周涨幅
                {
                    infoData.ExtendData.FWeek={};
                    if (item.fweek.week1!=null) infoData.ExtendData.FWeek.Week1=item.fweek.week1;
                    if (item.fweek.week4!=null) infoData.ExtendData.FWeek.Week4=item.fweek.week4;
                }
                this.Data.push(infoData);
            }
        }

        param.HQChart.UpdataChartInfo();
        param.HQChart.Draw();
    }
}


//投资者关系 (调研)
function ResearchInfo()
{
    this.newMethod=IKLineInfo;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='ResearchInfo';

    this.RequestData=function(hqChart)
    {
        var self = this;
        var param=
        {
            HQChart:hqChart
        };

        this.Data=[];

        //请求数据
        $.ajax({
            url: g_JSChartResource.KLine.Info.Research.ApiUrl,
            data:
            {
                "filed": ["releasedate","researchdate","level","symbol","id"],
                "querydate":{"StartDate":this.StartDate,"EndDate":this.GetToday()},
                "symbol": [param.HQChart.Symbol],
                "start":0,
                "end":this.MaxReqeustDataCount,
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (recvData)
            {
                self.RecvData(recvData,param);
            }
        });

        return true;
    }

    this.RecvData=function(recvData,param)
    {
        if (recvData.list.length<=0) return;

        for(var i in recvData.list)
        {
            var item=recvData.list[i];
            var infoData=new KLineInfoData();
            infoData.ID=item.id;
            infoData.Date= item.researchdate;
            infoData.InfoType=KLINE_INFO_TYPE.RESEARCH;
            infoData.ExtendData={ Level:item.level };
            this.Data.push(infoData);

        }

        param.HQChart.UpdataChartInfo();
        param.HQChart.Draw();
    }
}


//大宗交易
function BlockTrading()
{
    this.newMethod=IKLineInfo;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='BlockTrading';

    this.RequestData=function(hqChart)
    {
        var self = this;
        var param=
        {
            HQChart:hqChart
        };

        this.Data=[];

        //请求数据
        $.ajax({
            url: g_JSChartResource.KLine.Info.BlockTrading.ApiUrl,
            data:
            {
                "field": ["blocktrading.price","blocktrading.vol","blocktrading.premium","fweek","price"],
                "condition":
                [
                    {"item":["date","int32","gte",this.StartDate]},
                    {"item":["blocktrading.vol","int32","gte","0"]}
                ],
                "symbol": [param.HQChart.Symbol],
                "start":0,
                "end":this.MaxReqeustDataCount,
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (recvData)
            {
                self.RecvData(recvData,param);
            }
        });

        return true;
    }

    this.RecvData=function(recvData,param)
    {
        if (recvData.stock.length!=1) return;
        if (recvData.stock[0].stockday.length<=0) return;

        for(var i in recvData.stock[0].stockday)
        {
            var item=recvData.stock[0].stockday[i];
            var infoData=new KLineInfoData();
            infoData.Date= item.date;
            infoData.InfoType=KLINE_INFO_TYPE.BLOCKTRADING;
            infoData.ExtendData=
            {
                Price:item.blocktrading.price,          //交易价格
                Premium:item.blocktrading.premium,      //溢价 （百分比%)
                Vol:item.blocktrading.vol,              //交易金额单位（万元)
                ClosePrice:item.price,                  //收盘价
            };

            if(item.fweek)  //未来周涨幅
            {
                infoData.ExtendData.FWeek={};
                if (item.fweek.week1!=null) infoData.ExtendData.FWeek.Week1=item.fweek.week1;
                if (item.fweek.week4!=null) infoData.ExtendData.FWeek.Week4=item.fweek.week4;
            }

            this.Data.push(infoData);
        }

        param.HQChart.UpdataChartInfo();
        param.HQChart.Draw();
    }
}



//龙虎榜
function TradeDetail()
{
    this.newMethod=IKLineInfo;   //派生
    this.newMethod();
    delete this.newMethod;

    this.ClassName='TradeDetail';

    this.RequestData=function(hqChart)
    {
        var self = this;
        var param=
        {
            HQChart:hqChart
        };

        this.Data=[];

        //请求数据
        $.ajax({
            url: g_JSChartResource.KLine.Info.TradeDetail.ApiUrl,
            data:
            {
                "field": ["tradedetail.typeexplain","tradedetail.type","fweek"],
                "condition":
                [
                    {"item":["date","int32","gte",this.StartDate]},
                    {"item":["tradedetail.type","int32","gte","0"]}
                ],
                "symbol": [param.HQChart.Symbol],
                "start":0,
                "end":this.MaxReqeustDataCount,
            },
            type:"post",
            dataType: "json",
            async:true,
            success: function (recvData)
            {
                self.RecvData(recvData,param);
            }
        });

        return true;
    }

    this.RecvData=function(recvData,param)
    {
        if (recvData.stock.length!=1) return;
        if (recvData.stock[0].stockday.length<=0) return;

        for(var i in recvData.stock[0].stockday)
        {
            var item=recvData.stock[0].stockday[i];

            var infoData=new KLineInfoData();
            infoData.Date= item.date;
            infoData.InfoType=KLINE_INFO_TYPE.TRADEDETAIL;
            infoData.ExtendData={Detail:new Array()};

            for(var j in item.tradedetail)
            {
                var tradeItem=item.tradedetail[j]; 
                infoData.ExtendData.Detail.push({"Type":tradeItem.type,"TypeExplain":tradeItem.typeexplain});
            }

            if(item.fweek)  //未来周涨幅
            {
                infoData.ExtendData.FWeek={};
                if (item.fweek.week1!=null) infoData.ExtendData.FWeek.Week1=item.fweek.week1;
                if (item.fweek.week4!=null) infoData.ExtendData.FWeek.Week4=item.fweek.week4;
            }

            this.Data.push(infoData);
        }

        param.HQChart.UpdataChartInfo();
        param.HQChart.Draw();
    }
}

//是否是指数代码
function IsIndexSymbol(symbol)
{
    var upperSymbol=symbol.toUpperCase();
    if (upperSymbol.indexOf('.SH')>0)
    {
        upperSymbol=upperSymbol.replace('.SH','');
        if (upperSymbol.charAt(0)=='0' && parseInt(upperSymbol)<=3000) return true;

    }
    else if (upperSymbol.indexOf('.SZ')>0)
    {
        upperSymbol=upperSymbol.replace('.SZ','');
        if (upperSymbol.charAt(0)=='3' && upperSymbol.charAt(1)=='9') return true;
    }
    else if (upperSymbol.indexOf('.CI')>0)  //自定义指数
    {
        return true;
    }

    return false;
}

//是否是基金代码
function IsFundSymbol(symbol)
{
    if (!symbol) return false;

    var upperSymbol=symbol.toUpperCase();
    if (upperSymbol.indexOf('.SH')>0)
    {
        upperSymbol=upperSymbol.replace('.SH','');  //51XXXX.sh
        if (upperSymbol.charAt(0)=='5' && upperSymbol.charAt(1)=='1') return true;
    }
    else if (upperSymbol.indexOf('.SZ')>0)
    {
        upperSymbol=upperSymbol.replace('.SZ','');  //15XXXX.sz, 16XXXX.sz, 17XXXX.sz, 18XXXX.sz
        if (upperSymbol.charAt(0)=='1' && 
            (upperSymbol.charAt(1)=='5' || upperSymbol.charAt(1)=='6' || upperSymbol.charAt(1)=='7' || upperSymbol.charAt(1)=='8') ) return true;
    }

    return false;
}

//设置窗口基类
function IDivDialog(divElement)
{
    this.DivElement=divElement;     //父节点
    this.ID=null;                   //div id
    this.TimeOut=null;              //定时器

    //隐藏窗口
    this.Hide=function()
    {
        $("#"+this.ID).hide();
    }

    //显示窗口
    this.Show=function(left,top,width,height)
    {
        //显示位置
        $("#"+this.ID).css({'display':'block','top':top+'px', "left":left+'px', "width":width+'px', "height":height+'px' });
    }
}


//修改指标
function ModifyIndexDialog(divElement)
{
    this.newMethod=IDivDialog;   //派生
    this.newMethod(divElement);
    delete this.newMethod;

    this.Title={ ID:Guid() };      //标题
    this.ParamList={ID:Guid() };   //参数列表  class='parameter-content'
    this.ParamData=[];              //{ ID:参数ID, Value:参数值}
    this.Identify;
    this.HQChart;

    //创建
    this.Create=function()
    {
        this.ID=Guid();

        var div=document.createElement('div');
        div.className='jchart-modifyindex-box';
        div.id=this.ID;
        div.innerHTML=
        "<div class='parameter'>\
            <div class='parameter-header'>\
                <span></span>\
                <strong id='close' class='icon iconfont icon-close'></strong>\
            </div>\
            <div class='parameter-content'><input/>MA</div>\
        <div class='parameter-footer'>\
            <button class='submit' >确定</button>\
            <button class='cancel' >取消</button>\
        </div>\
        </div>";

        this.DivElement.appendChild(div);

        //确定按钮
        $("#"+this.ID+" .submit").click(
            {
                divBox:this,
            },
            function(event)
            {
                event.data.divBox.Hide();
            });

        //给一个id 后面查找方便
        var titleElement=div.getElementsByTagName('span')[0];
        titleElement.id=this.Title.ID;

        var paramListElement=div.getElementsByClassName('parameter-content')[0];
        paramListElement.id=this.ParamList.ID;
    }

    //设置标题
    this.SetTitle=function(title)
    {
        $("#"+this.Title.ID).html(title);
    }

    //清空参数
    this.ClearParamList=function()
    {
        $("#"+this.ParamList.ID).empty();
        this.ParamData=[];
    }

    this.BindParam=function(chart,identify)
    {
        var windowIndex=chart.WindowIndex[identify];
        for(var i in windowIndex.Arguments)
        {
            var item=windowIndex.Arguments[i];
            if (item.Name==null || isNaN(item.Value)) break;

            var guid=Guid();
            var param = '<input class="row-line" id="'+guid+'" value="'+item.Value+'" type="number" step="1"/>'+ item.Name +'<br>';
            $("#"+this.ParamList.ID).append(param);

            this.ParamData.push({ID:guid,Value:item.Value});
        }

        //绑定参数修改事件
        var self=this;
        for(var i in this.ParamData)
        {
            var item=this.ParamData[i];
            $("#"+item.ID).mouseup(
                {
                    Chart:chart,
                    Identify:identify,
                    ParamIndex:i   //参数序号
                },
                function(event)
                {
                    var value = parseInt($(this).val());                            //获取当前操作的input属性值，转化为整型
                    var chart=self.HQChart;
                    var identify=self.Identify;
                    var paramIndex=event.data.ParamIndex;

                    chart.WindowIndex[identify].Arguments[paramIndex].Value = value;    //为参数属性重新赋值
                    chart.UpdateWindowIndex(identify);                              //调用更新窗口指标函数，参数用来定位窗口
                }
            )

            $("#"+item.ID).keyup(
                {
                    Chart:chart,
                    Identify:identify,
                    ParamIndex:i   //参数序号
                },
                function(event)
                {
                    var value = parseInt($(this).val());                            //获取当前操作的input属性值，转化为整型
                    var chart=self.HQChart;
                    var identify=self.Identify;
                    var paramIndex=event.data.ParamIndex;

                    chart.WindowIndex[identify].Arguments[paramIndex].Value = value;    //为参数属性重新赋值
                    chart.UpdateWindowIndex(identify);                              //调用更新窗口指标函数，参数用来定位窗口
                }
            )
        }
    }

    //绑定取消事件
    this.BindCancel=function()
    {
        //取消按钮事件
        var self=this;
        $("#"+this.ID+" .cancel").click(
            function()
            {
                var chart=self.HQChart;
                var identify=self.Identify;
                self.RestoreParam(chart.WindowIndex[identify]);
                chart.UpdateWindowIndex(identify);
                self.Hide();
            }
        );

        //关闭和取消是一样的
        $("#"+this.ID+" #close").click(
            function()
            {
                var chart=self.HQChart;
                var identify=self.Identify;

                self.RestoreParam(chart.WindowIndex[identify]);
                chart.UpdateWindowIndex(identify);
                self.Hide();
            }
        );
    }

    //还原参数
    this.RestoreParam=function(windowIndex)
    {
        for(var i in this.ParamData)
        {
            var item=this.ParamData[i];
            windowIndex.Arguments[i].Value=item.Value;
        }
    }

    //显示
    this.DoModal=function(event)
    {
        var chart=event.data.Chart;
        var identify=event.data.Identify;
        var dialog=chart.ModifyIndexDialog;

        if(!dialog) return;

        if (dialog.ID==null) dialog.Create();   //第1次 需要创建div
        dialog.Identify=identify;
        dialog.HQChart=chart;
        dialog.SetTitle(chart.WindowIndex[identify].Name+" 指标参数设置");      //设置标题
        dialog.ClearParamList();            //清空参数
        dialog.BindParam(chart,identify);   //绑定参数
        dialog.BindCancel();  //绑定取消和关闭事件

        //居中显示
        var border=chart.Frame.ChartBorder;
        var scrollPos=GetScrollPosition();
        var left=border.GetLeft()+border.GetWidth()/2;
        var top=border.GetTop()+border.GetHeight()/2;
        //left = left + border.UIElement.getBoundingClientRect().left+scrollPos.Left;
        //top = top+ border.UIElement.getBoundingClientRect().top+scrollPos.Top;

        dialog.Show(left,top,200,200);      //显示

    }
}

//换指标
function ChangeIndexDialog(divElement)
{
    this.newMethod=IDivDialog;   //派生
    this.newMethod(divElement);
    delete this.newMethod;

    this.DivElement=divElement;   //父节点
    this.IndexTreeApiUrl="https://opensourcecache.zealink.com/cache/hqh5/index/commonindextree.json";      //数据下载地址

    this.Create=function()
    {
        var div=document.createElement('div');
        div.className='jchart-changeindex-box';
        div.id=this.ID=Guid();
        div.innerHTML=
        '<div class="target-panel">\n' +
            '            <div class="target-header">\n' +
            '                <span>换指标</span>\n' +
            '                <strong class="close-tar icon iconfont icon-close"></strong>\n' +
            '            </div>\n' +
            '            <div class="target-content">\n' +
            '                <div class="target-left">\n' +
            '                    <input type="text">\n' +
            '                    <ul></ul>\n' +
            '                </div>\n' +
            '                <div class="target-right">\n' +
            '                    <ul></ul>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '        </div>';

        this.DivElement.appendChild(div);
    }

    //下载数据 如果上次下载过可以 可以不用下载
    this.ReqeustData=function()
    {
        if($(".target-left ul li").length>0){
            return false;
        }
        var url = this.IndexTreeApiUrl;
        $.ajax({
            url: url,
            type: 'get',
            success: function (res) {
                var item = res.list;
                changeIndexLeftList(item);   //处理左侧list列表
                changeIndexRightList(item);  //处理右侧内容列表
            }
        });

        //处理左侧list列表
        function changeIndexLeftList(item) {
            $.each(item,function(i,result){
                var htmlList;
                htmlList = '<li>' + result.node + '</li>';
                $(".target-left ul").append(htmlList);
            });
            //默认选中第一项
            $(".target-left ul li:first-child").addClass("active-list");
        }
        //处理右侧内容列表
        function changeIndexRightList(listNum) {
            var contentHtml;
            var conData = [];
            $.each(listNum,function(index,result){
                conData.push(result.list);
            })
            //页面初始化时显示第一个列表分类下的内容
            $.each(conData[0],function (i, res) {
                contentHtml = '<li id='+res.id+'>'+ res.name +'</li>';
                $(".target-right ul").append(contentHtml);
            })
            //切换list
            $(".target-left ul").delegate("li","click",function () {
                $(this).addClass("active-list").siblings().removeClass("active-list");
                var item = $(this).index();
                $(".target-right ul").html("");
                $.each(conData[item],function (i, res) {
                    contentHtml = '<li id='+res.id+'>'+ res.name +'</li>';
                    $(".target-right ul").append(contentHtml);
                })
            })
        }
    }

    this.BindClose=function(chart)
    {
        //关闭按钮
        $("#"+this.ID+" .close-tar").click(
            {
                Chart:chart,
            },
            function(event)
            {
                var chart=event.data.Chart;
                chart.ChangeIndexDialog.Hide();
            }
        );
    }

    //搜索事件
    this.BindSearch=function(chart)
    {
        $(".target-left input").on('input',
            {
                Chart:chart
            },
            function(event)
            {
                let scriptData = new JSIndexScript();
                let result=scriptData.Search(event.target.value);

                $(".target-right ul").html("");
                for(var i in result)
                {
                    var name=result[i];
                    var contentHtml = '<li id='+name+'>'+ name +'</li>';
                    $(".target-right ul").append(contentHtml);
                }
                
            }
        );
    }

    this.DoModal=function(event)
    {
        var chart=event.data.Chart;
        var identify=event.data.Identify;
        var dialog=chart.ChangeIndexDialog;

        if(!dialog) return;

        if (dialog.ID==null) dialog.Create();   //第1次 需要创建div
        dialog.ReqeustData();   //下载数据

        //切换窗口指标类型  每次委托事件执行之前，先用undelegate()解除之前的所有绑定
        changeIndeWindow();
        function changeIndeWindow() {
            $(".target-right ul").undelegate().delegate("li","click",function () {
                var idV = $(this).attr("id");
                chart.ChangeIndex(identify,idV);
                $(this).addClass("active-list").siblings().removeClass("active-list");
            });
        }

        dialog.BindSearch(chart);
        //关闭弹窗
        dialog.BindClose(chart);

        //居中显示
        var border=chart.Frame.ChartBorder;
        var scrollPos=GetScrollPosition();
        var left=border.GetLeft()+border.GetWidth()/2;
        var top=border.GetTop()+border.GetHeight()/2;
        //left = left + border.UIElement.getBoundingClientRect().left+scrollPos.Left;
        //top = top+ border.UIElement.getBoundingClientRect().top+scrollPos.Top;
        dialog.Show(left,top,200,200);

    }
}

//信息地理tooltip
function KLineInfoTooltip(divElement)
{
    this.newMethod=IDivDialog;   //派生
    this.newMethod(divElement);
    delete this.newMethod;

    this.UpColor=g_JSChartResource.UpTextColor;
    this.DownColor=g_JSChartResource.DownTextColor;
    this.UnchagneColor=g_JSChartResource.UnchagneTextColor;

    this.Create=function()
    {
        this.ID=Guid();

        var div=document.createElement('div');
        div.className='jchart-klineinfo-tooltip';
        div.id=this.ID;
        div.innerHTML="<div class='title-length'></div>";
        this.DivElement.appendChild(div);
    }


    this.BindInfoList=function(infoType,infoList)
    {
        var strBox="<div class='total-list'>共"+infoList.length+"条</div>";
        var strText=[];
        for(var i in infoList)
        {
            var item=infoList[i];
            var strOld=item.Date;
            if(infoType==KLINE_INFO_TYPE.PFORECAST)
            {
                var reportDate=item.ExtendData.ReportDate;
                var year=parseInt(reportDate/10000);  //年份
                var day=reportDate%10000;   //比较 这个去掉年份的日期
                var reportType;
                if(day == 1231){
                    reportType = "年报"
                }else if(day == 331){
                    reportType = "一季度报"
                }else if(day == 630){
                    reportType = "半年度报"
                }else if(day == 930){
                    reportType = "三季度报"
                }

                var weekData="";
                if (item.ExtendData.FWeek)
                {
                    if (item.ExtendData.FWeek.Week1!=null) weekData+="一周后涨幅:<i class='increase' style='color:"+this.GetColor(item.ExtendData.FWeek.Week1.toFixed(2))+"'>"+ item.ExtendData.FWeek.Week1.toFixed(2)+"%</i>";
                    if (item.ExtendData.FWeek.Week4!=null) weekData+="&nbsp;四周后涨幅:<i class='increase' style='color:"+this.GetColor(item.ExtendData.FWeek.Week4.toFixed(2))+"'>"+ item.ExtendData.FWeek.Week4.toFixed(2)+"%</i>";
                    if (weekData.length>0) weekData="<br/>&nbsp;&nbsp;<i class='prorecast-week'>"+weekData+"</i>";
                }
                var strDate=item.Date.toString();
                var strNew=strDate.substring(0,4)+"-"+strDate.substring(4,6)+"-"+strDate.substring(6,8);  //转换时间格式
                strText+="<span>"+strNew+"&nbsp;&nbsp;"+year+reportType+item.Title+"&nbsp;"+weekData+"</span>";

            }
            else if (infoType==KLINE_INFO_TYPE.RESEARCH)    //调研单独处理
            {
                var levels=item.ExtendData.Level;
                var recPerson=[];
                if(levels.length==0){
                    recPerson = "<i>无</i>"
                }else{
                    for(var j in levels)
                    {
                        if(levels[j]==0){
                            recPerson+="<i style='color:#00a0e9'>证券代表&nbsp;&nbsp;&nbsp;</i>";
                        }else if(levels[j]==1){
                            recPerson+="<i>董秘&nbsp;&nbsp;&nbsp;</i>";
                        }else if(levels[j]==2){
                            recPerson+="<i style='color:#00a0e9'>总经理&nbsp;&nbsp;&nbsp;</i>";
                        }else if(levels[j]==3){
                            recPerson+="<i style='color:#00a0e9'>董事长&nbsp;&nbsp;&nbsp;</i>";
                        }
                    }
                }
                var strDate=item.Date.toString();
                var strNew=strDate.substring(0,4)+"-"+strDate.substring(4,6)+"-"+strDate.substring(6,8);  //转换时间格式
                strText+="<span>"+strNew+"&nbsp;&nbsp;&nbsp;接待:&nbsp;&nbsp;&nbsp;"+recPerson+"</span>";
            }else if(infoType==KLINE_INFO_TYPE.BLOCKTRADING)
            {
                var showPriceInfo = item.ExtendData;
                var strDate=item.Date.toString();
                var strNew=strDate.substring(0,4)+"-"+strDate.substring(4,6)+"-"+strDate.substring(6,8);  //转换时间格式
                strText+="<span><i class='date-tipbox'>"+strNew+"</i>&nbsp;&nbsp;<i class='tipBoxTitle'>成交价:&nbsp;"+showPriceInfo.Price.toFixed(2)+"</i><i class='tipBoxTitle'>收盘价:&nbsp;"+showPriceInfo.ClosePrice.toFixed(2)+
                    "</i><br/><i class='rate-discount tipBoxTitle'>溢折价率:&nbsp;<strong style='color:"+ this.GetColor(showPriceInfo.Premium.toFixed(2))+"'>"+
                    showPriceInfo.Premium.toFixed(2)+"%</strong></i><i class='tipBoxTitle'>成交量(万股):&nbsp;"+showPriceInfo.Vol.toFixed(2)+"</i></span>";
            }
            else if (infoType==KLINE_INFO_TYPE.TRADEDETAIL) //龙虎榜
            {
                /*var detail=[
                    "日价格涨幅偏离值达到9.89%",
                    "日价格涨幅偏离值达格涨幅偏离值达格涨幅偏离值达到9.89%"
                ]*/
                var detail=item.ExtendData.Detail;
                //格式：日期 上榜原因: detail[0].TypeExplain
                //                    detail[1].TypeExplain
                //      一周后涨幅: xx 四周后涨幅: xx
                var str=strOld.toString();
                var strNew=str.substring(0,4)+"-"+str.substring(4,6)+"-"+str.substring(6,8);  //转换时间格式
                var reasons = [];
                for(var i in detail){
                    reasons += "<i>"+detail[i].TypeExplain+"</i><br/>"
                    // reasons += detail[i] + "<br/>"
                }

                strText = "<span><i class='trade-time'>"+strNew+"&nbsp;&nbsp;&nbsp;上榜原因:&nbsp;&nbsp;</i><i class='reason-list'>"+reasons+"</i><br/><i class='trade-detall'>一周后涨幅:&nbsp;<strong style='color:"+
                    this.GetColor(item.ExtendData.FWeek.Week1.toFixed(2))+"'>"+ item.ExtendData.FWeek.Week1.toFixed(2)+
                    "%</strong>&nbsp;&nbsp;&nbsp;四周后涨幅:&nbsp;<strong style='color:"+this.GetColor(item.ExtendData.FWeek.Week4.toFixed(2))+";'>"+
                    item.ExtendData.FWeek.Week4.toFixed(2)+"%</strong></i></span>";
            }
            else
            {
                var str=strOld.toString();
                var strNew=str.substring(0,4)+"-"+str.substring(4,6)+"-"+str.substring(6,8);  //转换时间格式
                strText+="<span>"+strNew+"&nbsp;&nbsp;&nbsp;"+item.Title+"</span>";
            }
        }
        var titleInnerBox = $(".title-length").html(strText);

        $("#"+this.ID).html(titleInnerBox);

        //当信息超过8条时，添加“共XX条”统计总数
        if(infoList.length > 8){
            $("#"+this.ID).append(strBox);
        }
    }


    this.GetColor=function(price)
    {
        if(price>0) return this.UpColor;
        else if (price<0) return this.DownColor;
        else return this.UnchagneColor;
    }

    //显示窗口，改函数仅为KLineInfoTooltip使用
    this.Show=function(left,top,width,height,tooltip,times)
    {
        //显示位置
        $("#"+this.ID).css({'display':'block','top':top+'px', "left":left+'px', "width":width+'px', "height":height+'px' });

        function toolHide() {
            tooltip.Hide();
        }

        if (this.TimeOut!=null)
            clearTimeout(this.TimeOut); //清空上一次的定时器,防止定时器不停的被调用

        //设置窗口定时隐藏
        this.TimeOut=setTimeout(toolHide,times);

    }


    this.DoModal=function(event)
    {
        var chart=event.data.Chart;
        var infoType=event.data.InfoType;   //信息地雷类型
        var infoList=event.data.InfoList;    //信息数据列表
        var tooltip=chart.KLineInfoTooltip;

        if(!tooltip) return;
        if (tooltip.ID==null) tooltip.Create();   //第1次 需要创建div

        tooltip.BindInfoList(infoType,infoList);

        var left=event.pageX;
        var top=event.pageY+10;
        var widthTool=380;
        var heightTool=$("#"+tooltip.ID).height();

        if((left + widthTool) > chart.UIElement.getBoundingClientRect().width){
            left = left - widthTool;
        }
        /*if(top+heightTool>chart.UIElement.getBoundingClientRect().height){
            top=top-heightTool-45;
        }*/

        tooltip.Show(left,top,widthTool,"auto",tooltip,8000);
    }

    //鼠标离开
    this.Leave=function(event)
    {
        var chart=event.data.Chart;
        var tooltip=chart.KLineInfoTooltip;

        if(!tooltip || tooltip.ID==null) return;

        tooltip.Hide();
    }
}

//历史K线上双击 弹出分钟走势图框
function MinuteDialog(divElement)
{
    this.newMethod=IDivDialog;   //派生
    this.newMethod(divElement);
    delete this.newMethod;


    this.JSChart=null;
    this.Height=500;
    this.Width=600;
    this.Symbol;
    this.TradeDate;
    this.HistoryData;


    this.Create=function()
    {
        this.ID=Guid();
        var div=document.createElement('div');
        div.className='jchart-kline-minute-box';
        div.id=this.ID;
        div.innerHTML="<div><div class='minute-dialog-title'><span></span><strong class='close-munite icon iconfont icon-close'></strong></div></div>";
        div.style.width=this.Height+'px';
        div.style.height=this.Width+'px';

        this.DivElement.appendChild(div);
        this.JSChart=JSChart.Init(div);


        var option=
        {
            Type:'历史分钟走势图',
            Symbol:this.Symbol,     //股票代码
            IsAutoUpdate:false,       //是自动更新数据

            IsShowRightMenu:false,   //右键菜单
            HistoryMinute: { TradeDate:this.TradeDate, IsShowName:false, IsShowDate:false }   //显示的交易日期
        };

        this.JSChart.SetOption(option);
    }

    this.BindClose=function(chart)
    {
        //关闭按钮
        $("#"+this.ID+" .close-munite").click(
            {
                Chart:chart
            },
            function(event)
            {
                var chart=event.data.Chart;
                chart.MinuteDialog.Hide();
            }
        );
    }

    this.DoModal=function(event)
    {
        this.UpColor=g_JSChartResource.UpTextColor;
        this.DownColor=g_JSChartResource.DownTextColor;
        this.UnchagneColor=g_JSChartResource.UnchagneTextColor;

        var chart=event.data.Chart;
        var tooltip=event.data.Tooltip;
        var dialog=chart.MinuteDialog;

        dialog.Symbol=chart.Symbol;
        dialog.TradeDate=tooltip.Data.Date;

        if(!dialog) return;
        if (dialog.ID==null)
        {
            dialog.Create();   //第1次 需要创建div
        }
        else
        {
            dialog.JSChart.JSChartContainer.TradeDate=dialog.TradeDate;
            dialog.JSChart.ChangeSymbol(this.Symbol);
        }

        var left=event.clientX;
        var top=event.clientY+10;

        dialog.Show(500,100,600,500);
        dialog.JSChart.OnSize();

        this.BindClose(chart);

        this.GetColor=function(price,yclse)
        {
            if(price>yclse) return this.UpColor;
            else if (price<yclse) return this.DownColor;
            else return this.UnchagneColor;
        }

        var strName = event.data.Chart.Name;
        var strData=event.data.Tooltip.Data;
        var date=new Date(parseInt(strData.Date/10000),(strData.Date/100%100-1),strData.Date%100);
        var strDate = strData.Date.toString();
        var strNewDate=strDate.substring(0,4)+"-"+strDate.substring(4,6)+"-"+strDate.substring(6,8);  //转换时间格式
        var str = "<span>"+strName+"</span>"+"<span>"+strNewDate+"</span>&nbsp;"+
            "<span style='color:"+this.GetColor(strData.Open,strData.YClose)+";'>开:"+strData.Open.toFixed(2)+"</span>"+
            "<span style='color:"+this.GetColor(strData.High,strData.YClose)+";'>高:"+strData.High.toFixed(2)+"</span>"+
            "<span style='color:"+this.GetColor(strData.Low,strData.YClose)+";'>低:"+strData.Low.toFixed(2)+"</span>"+
            "<span style='color:"+this.GetColor(strData.Close,strData.YClose)+";'>收:"+strData.Close.toFixed(2)+"</span>"+
            "<span style='color:"+this.VolColor+";'>量:"+IFrameSplitOperator.FormatValueString(strData.Vol,2)+"</span>"+
            "<span style='color:"+this.AmountColor+";'>额:"+IFrameSplitOperator.FormatValueString(strData.Amount,2)+"</span>";
        $(".minute-dialog-title span").html(str);
    }
}

//区间统计
function KLineSelectRectDialog(divElement)
{
    this.newMethod=IDivDialog;   //派生
    this.newMethod(divElement);
    delete this.newMethod;

    this.SelectData;
    this.Dialog;
    this.HQChart;

    //隐藏窗口
    this.Close=function()
    {
        this.DivElement.removeChild(this.Dialog);
        this.HQChart.HideSelectRect();
    }

    //创建
    this.Create=function()
    {
        this.ID=Guid();
        var div=document.createElement('div');
        div.className='jchart-select-statistics-box';
        div.id=this.ID;
        div.innerHTML=
        "<div class='parameter jchart-select-section'>\
            <div class='parameter-header'>\
                <span>区间统计</span>\
                <strong id='close' class='icon iconfont icon-close'></strong>\
            </div>\
            <div class='parameter-content'>统计数据</div>\
        <div class='parameter-footer'>\
            <button id='close' class='submit' >确定</button>\
            <button id='match' class='submit' >形态匹配</button>\
        </div>\
        </div>";

        this.DivElement.appendChild(div);
        this.Dialog=div;

        //关闭按钮
        $("#"+this.ID+" #close").click(
            {
                divBox:this,
            },
            function(event)
            {
                event.data.divBox.Close();
            });
        
        //形态匹配
        $("#"+this.ID+" #match").click(
            {
                divBox:this,
            },
            function(event)
            {
                event.data.divBox.KLineMatch();
                event.data.divBox.Close();
            });   
    }

    this.BindData=function()
    {
        var hqData=this.SelectData.Data;
        var start=this.SelectData.Start;
        var end=this.SelectData.End;

        var showData=
        { 
            Open:0,Close:0,High:0,Low:0, YClose:0,
            Vol:0, Amount:0, Date:{Start:0,End:0}, Count:0,
            KLine:{ Up:0,Down:0,Unchanged:0 }    //阳线|阴线|平线
        }

        for(var i=start; i<=end && i<hqData.Data.length; ++i)
        {
            var item=hqData.Data[i];
            if (i==start) 
            {
                showData.Date.Start=item.Date;
                showData.Open=item.Open;
                showData.High=item.High;
                showData.Low=item.Low;
                showData.YClose=item.YClose;
            }

            showData.Date.End=item.Date;
            showData.Close=item.Close;
            showData.Vol+=item.Vol;
            showData.Amount+=item.Amount;
            ++showData.Count;
            if (showData.High<item.High) showData.High=item.High;
            if(showData.Low>item.Low) showData.Low=item.Low;
            if (item.Close>item.Open) ++showData.KLine.Up;
            else if (item.Close<item.Open) ++showData.KLine.Down;
            else ++showData.KLine.Unchanged;
        }

        if (showData.Vol>0) showData.AvPrice=showData.Amount/showData.Vol;  //均价
        if (item.YClose>0)
        {
            showData.Increase = (showData.Close - showData.YClose) / showData.YClose *100;   //涨幅
            showData.Amplitude = (showData.High - showData.Low) / showData.YClose * 100;     //振幅
        }

        // console.log('[KLineSelectRectDialog::BindData]', showData);
        var defaultfloatPrecision=GetfloatPrecision(this.SelectData.Symbol);
        var startDate = showData.Date.Start.toString().substring(0,4) + "/" + showData.Date.Start.toString().substring(4,6) + "/" +  showData.Date.Start.toString().substring(6,8);
        var endDate = showData.Date.End.toString().substring(0,4) +  "/" + showData.Date.End.toString().substring(4,6) +  "/" + showData.Date.End.toString().substring(6,8);

        var startLeftClass="",startRightClass="",endLeftClass="",endRightClass="";
        if(start<=0) startLeftClass = "BtnBackground";
        if(start >= end) {
            startRightClass = "BtnBackground";
            endLeftClass = "BtnBackground";
        }
        if(end >= hqData.Data.length - 1) endRightClass = "BtnBackground";

        var div=document.createElement('div');
        div.className='jchart-select-table-right';
        div.innerHTML=
            '<div class="jchart-select-date">\n' +
            '            <span>开始: '+ startDate +'<i class="start-date-left '+ startLeftClass +'"><</i><i class="start-date-right '+ startRightClass +'">></i></span>\n' +
            '            <span>结束: '+ endDate +'<i class="end-date-left '+ endLeftClass +'"><</i><i class="end-date-right '+ endRightClass +'">></i></span>\n' +
            '            <span>总个数: '+ showData.Count +'</span>\n' +
            '        </div>\n' +
            '        <table>\n' +
            '            <tr><td><strong>起始价: </strong><span>'+ showData.YClose.toFixed(defaultfloatPrecision) +'</span></td>' +
            '               <td><strong>最终价: </strong><span>'+ showData.Close.toFixed(defaultfloatPrecision) +'</span></td>' +
            '               <td><strong>均价: </strong><span>'+ showData.AvPrice.toFixed(defaultfloatPrecision) +'</span></td></tr>\n' +
            '            <tr><td><strong>最低价: </strong><span>'+ showData.Low.toFixed(defaultfloatPrecision) +'</span></td>' +
            '               <td><strong>最高价: </strong><span>'+ showData.High.toFixed(defaultfloatPrecision) +'</span></td>' +
            '               <td><strong>涨跌幅: </strong><span class="'+ IFrameSplitOperator.FormatValueColor(showData.Increase) +'">'+ showData.Increase.toFixed(2) +'%</span></td></tr>\n' +
            '            <tr><td><strong>振幅: </strong><span>'+ showData.Amplitude.toFixed(2) +'%</span></td>' +
            '               <td><strong>成交量: </strong><span>'+ IFrameSplitOperator.FormatValueString(showData.Vol,2) +'股</span></td>' +
            '               <td><strong>金额: </strong><span>'+ IFrameSplitOperator.FormatValueString(showData.Amount,2) +'元</span></td></tr>\n' +
            '            <tr><td><strong>阴线: </strong><span>'+ showData.KLine.Up +'</span></td>' +
            '               <td><strong>阳线: </strong><span>'+ showData.KLine.Down +'</span></td>' +
            '               <td><strong>平线: </strong><span>'+ showData.KLine.Unchanged +'</span></td></tr>\n' +
            '        </table>';

        $(".parameter-content").html(div);
        this.BindEvent();
    }

    this.BindEvent = function () {
        var _self = this;
        if(_self.SelectData.Start > 0){
            $(".jchart-select-date .start-date-left").click(function () {
                _self.SelectData.Start--;
                _self.BindData();
                _self.HQChart.UpdateSelectRect(_self.SelectData.Start,_self.SelectData.End);
            })
        }
        if(_self.SelectData.Start < _self.SelectData.End){
            $(".jchart-select-date .start-date-right").click(function () {
                _self.SelectData.Start++;
                _self.BindData();
                _self.HQChart.UpdateSelectRect(_self.SelectData.Start,_self.SelectData.End);
            })
            $(".jchart-select-date .end-date-left").click(function () {
                _self.SelectData.End--;
                _self.BindData();
                _self.HQChart.UpdateSelectRect(_self.SelectData.Start,_self.SelectData.End);
            })
        }
        if(_self.SelectData.End < _self.SelectData.Data.Data.length - 1){
            $(".jchart-select-date .end-date-right").click(function () {
                _self.SelectData.End++;
                _self.BindData();
                _self.HQChart.UpdateSelectRect(_self.SelectData.Start,_self.SelectData.End);
            })
        }
    }

    //显示
    this.DoModal=function(event)
    {
        var chart=event.data.Chart;
        if (this.ID==null) this.Create();   //第1次 需要创建div
        this.SelectData=event.data.SelectData;
        this.HQChart=chart;

        this.BindData();

        //居中显示
        var border=chart.Frame.ChartBorder;
        var scrollPos=GetScrollPosition();
        var left=border.GetWidth()/2;
        var top=border.GetHeight()/2;
        //left = left + border.UIElement.getBoundingClientRect().left+scrollPos.Left;
        //top = top+ border.UIElement.getBoundingClientRect().top+scrollPos.Top;

        this.Show(left,top,200,200);      //显示
    }

    //形态匹配
    this.KLineMatch=function(data)
    {
        var hqChart=this.HQChart;
        var scope={Plate:["CNA.ci"],Minsimilar:0.90};   //沪深A股, 相似度>=90%
        hqChart.RequestKLineMatch(this.SelectData, scope);
    }
}

//形态选股
function KLineMatchDialog(divElement)
{
    this.newMethod=IDivDialog;   //派生
    this.newMethod(divElement);
    delete this.newMethod;

    this.MatchData;     //匹配的股票数据
    this.Sample;        //样本数据
    this.Dialog;
    this.HQChart;

    this.PageData; //分页数据

    //隐藏窗口
    this.Close=function()
    {
        this.DivElement.removeChild(this.Dialog);
    }

    //创建
    this.Create=function()
    {
        this.ID=Guid();
        var div=document.createElement('div');
        div.className='jchart-kline-match-box';
        div.id=this.ID;
        div.innerHTML=
        `<div class='parameter jchart-kline-match-box'>
            <div class='parameter-header'>
                <span>形态匹配</span>
                <strong id='close' class='icon iconfont icon-close'></strong>
            </div>
            <div class='parameter-content'>
                <table class='matchTable'>
                    <thead>
                        <tr>
                            <td>股票名称</td>
                            <td>匹配度</td>
                            <td>时间段</td>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
                <div class='pagination' data-current='1'></div>
            </div>
            <div class='parameter-footer'>
                <button id='close' class='submit' >确定</button>
            </div>
        </div>`.trim();

        this.DivElement.appendChild(div);
        this.Dialog=div;

        //关闭按钮
        $("#"+this.ID+" #close").click(
            {
                divBox:this,
            },
            function(event)
            {
                event.data.divBox.Close();
            });
    }

    this.BindData=function()
    {
        console.log(`[KLineMatchDialog::BindData] 形态源: ${this.Sample.Stock.Name} 区间:${this.Sample.Date.Start} - ${this.Sample.Date.End}`);
        var count = this.MatchData.length + 1;
        var pageData = {NewData:{},MetaData:[],PageCount:0,Count:count};
        var pageCount = 0;
        var paginationHtml = ''
        for(let i = 0; i < count ; i++){
            var dataObj = {};
            if(i == 0){
                dataObj = {
                    Symbol:this.Sample.Stock.Symbol,
                    Name:this.Sample.Stock.Name,
                    Rate:'形态源',
                    Color:'red',
                    Date:`${this.Sample.Date.Start}-${this.Sample.Date.End}`
                };
            }else{
                let dataItem = this.MatchData[i - 1];
                dataObj = {
                    Symbol:dataItem.Symbol,
                    Name:dataItem.Name,
                    Rate:Number(dataItem.Similar * 100).toFixed(2),
                    Color:'',
                    Date:`${dataItem.Start}-${dataItem.End}`
                };
            }
            pageData.MetaData.push(dataObj);
        }

        if(pageData.Count % 10 == 0){
            pageCount = pageData.Count / 10;
        }else{
            pageCount = Math.floor(pageData.Count / 10) + 1;
        }
        pageData.PageCount = pageCount;

        this.PaginationMetaData(pageData);
        this.PageData = pageData;
        console.log('[KLineMatchDialog::DoModal pageData]',pageData);

        this.RenderDom(1);

        this.PaginationInit('#'+this.ID,pageData.PageCount,this.paginationCallback);
        // $('#' + this.ID + ' .pagination').html(paginationHtml);

        
    }
    this.RenderDom = function(page){
        let currentPageData = this.PageData.NewData[page];
        console.log('[KLineMatchDialog::RenderDom currentPageData]',currentPageData);
        let bodyHtml = '';
        for(let i = 0; i < currentPageData.length; i++){
            bodyHtml += `<tr>
                        <td class=${currentPageData[i].Color}>${currentPageData[i].Name}</td>
                        <td class=${currentPageData[i].Color}>${currentPageData[i].Rate}</td>
                        <td class=${currentPageData[i].Color}>${currentPageData[i].Date}</td>
                    </tr>`.trim();
        }
        
        $('#'+this.ID + ' .matchTable tbody').html(bodyHtml)
    }
    var _this = this;
    this.paginationCallback = function(page) {
        _this.RenderDom(page);
        _this.PaginationInit('#'+_this.ID,_this.PageData.PageCount,_this.paginationCallback); //更新UI
    }
    this.PaginationInit = function(id, maxPageNum, callback) {  //初始化分页
        var spanStr = "";
        var currentPageNum = $(id + " .pagination").data("current");
        var lastPageNum = 0;
        var showCountPage = 5; //只显示5个数字项
    
        if (currentPageNum < showCountPage) {  //当前页小于预显示页数
            if (maxPageNum >= showCountPage) {
                for (var j = 0; j < showCountPage; j++) {  //上 1 2 3 4 5 下
                    spanStr += (j + 1) != currentPageNum ? "<span>" + (j + 1) + "</span>" : "<span class='active'>" + (j + 1) + "</span>";
                }
            } else {
                for (var j = 0; j < maxPageNum; j++) {  //上 1 2 3 4 5 下
                    spanStr += (j + 1) != currentPageNum ? "<span>" + (j + 1) + "</span>" : "<span class='active'>" + (j + 1) + "</span>";
                }
            }
        } else { //大于5时，最终页数是当前页数加1
            lastPageNum = (currentPageNum + 1) > maxPageNum ? currentPageNum : (currentPageNum + 1);

            for (var i = currentPageNum - 3; i <= lastPageNum; i++) { //含最终项之前的五项
                spanStr += i != currentPageNum ? "<span>" + i + "</span>" : "<span class='active'>" + i + "</span>";
            }
        }
    
        spanStr = "<span class='beforePage'>上一页</span>" + spanStr + "<span class='nextPage'>下一页</span>";
        $(id + " .pagination").html(spanStr);
        $(id + " .pagination span").bind('click', { "maxpage": maxPageNum, "Callback": callback }, this.PaginationCurrentIndex);
        // return spanStr;
    }
    
    this.PaginationCurrentIndex = function(event) {  //分页切换
        var text = $(this).text();
        console.log('[::PaginationCurrentIndex text]',text);
        var currentPageNum = Number($(this).parent().data("current"));
        var maxPageNum = event.data.maxpage;
        var callback = event.data.Callback;
        var flag = 1;
        if (text === "上一页") {
            flag = currentPageNum === 1 ? currentPageNum : currentPageNum - 1;
        } else if (text === "下一页") {
            flag = currentPageNum === maxPageNum ? currentPageNum : currentPageNum + 1;
        } else {
            flag = Number(text);
        }
        $(this).parent().data("current", flag);  //将当前页存到dom上
        callback(flag);
    }
    
    this.PaginationMetaData = function(data){ //假分页数据,每页10条数据
        // data = {NewData:{},MetaData:[],PageCount:0,Callback:null};
        var newData = {};
        var metaData = data.MetaData;
        var pageCount = data.PageCount;
        
        for(let i = 0; i < pageCount; i++){
            var itemArr = [];
            for(let j = 0; j < 10; j++){
                var itemIndex = 10*i + j;
                if(itemIndex <= metaData.length - 1){
                    var item = metaData[itemIndex];
                    itemArr.push(item);
                }else {
                    break;
                }
            }
            newData[i+1] = itemArr;
        }
        data.NewData = newData;
    }

    //显示
    this.DoModal=function(event)
    {
        var chart=event.data.Chart;
        if (this.ID==null) this.Create();   //第1次 需要创建div
        this.MatchData=event.data.MatchData;
        this.Sample=event.data.Sample;
        this.HQChart=chart;

        this.BindData();
        

        //居中显示
        var border=chart.Frame.ChartBorder;
        var scrollPos=GetScrollPosition();
        var left=border.GetWidth()/2;
        var top=border.GetHeight()/2;

        this.Show(left,top,200,200);      //显示
    }
}

//K线右键菜单类
//id:"kline"
function KLineRightMenu(divElement)
{
    this.newMethod=IDivDialog;   //派生
    this.newMethod(divElement);
    delete this.newMethod;

    this.option={};

    this.Create = function () {
        var _self = this;

        this.ID=Guid();

        _self.BindData();
        _self.BindEvent();
    }
    this.BindData=function(){
        var _self = this;

        var id=this.DivElement.id;
        var $body=$("#"+id);

        var $topMenu = $("<div />");
        $topMenu.attr("id", "topMenu_"+_self.ID).addClass("context-menu-wrapper topmenu").hide();
        $body.append($topMenu);

        var $topTable = $("<table />");
        $topTable.attr({ id: "topTable_" + _self.ID, cellspacing: "0", cellpadding: "0" }).addClass("context-menu");
        $topMenu.append($topTable);

        $topTable.append(_self.childrenList(_self.option.data));

        for (var i = 0; i < _self.option.data.length; i++) {
            var isHasChildren = typeof _self.option.data[i].children != "undefined";

            if (isHasChildren) {

                var $childMenu = $("<div />");
                $childMenu.attr({ id: "childMenu_"+_self.ID + i, "data-index": i }).addClass("context-menu-wrapper").hide();
                $body.append($childMenu);

                var $childTable = $("<table />");
                $childTable.attr({ id: "childTable_" + _self.ID + i, cellspacing: "0", cellpadding: "0" }).addClass("context-menu");
                $childMenu.append($childTable);

                $childTable.append(_self.childrenList(_self.option.data[i].children));
            }
        }
    }

    this.Update=function()
    {
        var _self = this;
        var id=this.DivElement.id;
        var $body=$("#"+id);

        var $topTable = $("#topTable_" + _self.ID);
        $topTable.empty();
        $topTable.append(_self.childrenList(_self.option.data));

        for (var i = 0; i < _self.option.data.length; i++) {
            var isHasChildren = typeof _self.option.data[i].children != "undefined";

            if (isHasChildren) {
                var $childTable = $("#childTable_" + _self.ID + i);
                $childTable.empty();
                $childTable.append(_self.childrenList(_self.option.data[i].children));
            }
        }
        _self.BindEvent();
    }

    this.childrenList = function(list) {
        var result = [];

        for (var i = 0; i < list.length; i++) {
            var isBorder = typeof list[i].isBorder != "undefined" && list[i].isBorder;

            var $tr = $("<tr />");
            $tr.addClass("font_Arial context-menu");
            if (isBorder)
                $tr.addClass("border");

            var $td1 = $("<td />");
            if(list[i].selected){
                $td1.addClass("spacer context-menu").html("√");
            }else{
                $td1.addClass("spacer context-menu");
            }

            var $td2 = $("<td />");
            $td2.addClass("text").html(list[i].text);

            var $td3 = $("<td />");
            $td3.addClass("right shortcut");

            var $td4 = $("<td />");
            $td4.addClass(typeof list[i].children != "undefined" ? "submenu-arrow" : "context-menu spacer");

            $tr.append($td1).append($td2).append($td3).append($td4);

            result.push($tr);
        }
        return result;
    }

    this.Show=function (obj) {
        var _self = this;
        $.extend(_self.option, obj);

        if (!_self.ID) _self.Create();  //判断是否重复创建
        else _self.Update();            //更新菜单状态

        var $topMenu = $("#topMenu_"+_self.ID),
            topWidth = $topMenu.outerWidth(),
            topHeight = $topMenu.outerHeight();

        var x = _self.option.x,
            y = _self.option.y;

        if (topWidth > _self.option.position.X + _self.option.position.W- x) //超过了右边距
            x = x - topWidth;

        if (topHeight > _self.option.position.Y +_self.option.position.H - y)//超过了下边距
            y = y - topHeight;

        $topMenu.hide();
        $topMenu.css({ position:"absolute",left: x + "px", top: y + "px" }).show();

        this.isInit = true;
    }

    this.Hide=function () {
        var _self = this;

        $("#topMenu_" + _self.ID).hide();
        $("[id^='childMenu_" + _self.ID + "']").hide();
    }

    this.BindEvent=function () {
        var _self = this;
        var $childMenu = $("[id^='childMenu_" + _self.ID + "']");

        $("#topTable_" + _self.ID).find("tr").mouseenter(function () {
            var $this = $(this),
                index = $this.index(),
                $topMenu = $("#topMenu_" + _self.ID),
                $child = $("#childMenu_" + _self.ID + index),
                trWidth = $this.outerWidth(),
                trHeight = $this.outerHeight();

            var left = $topMenu.position().left + trWidth + 1;
            var top = $topMenu.position().top + (trHeight * index);

            if (trWidth > _self.option.position.X + _self.option.position.W - left) //超过了右边距
                left = left - trWidth - $topMenu.outerWidth() - 2;

            if ($child.outerHeight() > _self.option.position.Y +_self.option.position.H - top)//超过了下边距
                top = $topMenu.position().top + $topMenu.outerHeight() - $child.outerHeight();

            $childMenu.hide();
            $child.css({ left: left + "px", top: top + "px" }).show();
        }).mouseleave(function () {
            var index = $(this).index();
            setTimeout(function () {
                if ($("#childMenu_" + _self.ID + index).attr("data-isShow") != 1) {
                    $("#childMenu_" + _self.ID + index).hide();
                }
            }, 10)

        }).click(function () {
            var $this = $(this);
            var index = $this.index();

            if ($.type(_self.option.data[index].click) == "function") {
                _self.option.data[index].click(_self.option.returnData);
                $this.hide();
            }
        });


        $childMenu.mouseenter(function () {
            $(this).attr("data-isShow", "1");
        }).mouseleave(function () {
            $(this).attr("data-isShow", "0");
        });

        $childMenu.find("tr").click(function () {
            var $this = $(this);
            var divIndex = parseInt($this.closest("div").attr("data-index"));
            var trIndex = $this.index();

            if ($.type(_self.option.data[divIndex].children[trIndex].click) == "function") {
                _self.option.data[divIndex].children[trIndex].click(_self.option.windowIndex || 1);
                $childMenu.hide();
            }
        });
    }

    this.GetPeriod=function (chart) 
    {
        var data=
        [
            {
                text: "日线",
                click: function () { chart.ChangePeriod(0); }
            }, 
            {
                text: "周线",
                click: function () { chart.ChangePeriod(1); }
            }, 
            {
                text: "月线",
                click: function () { chart.ChangePeriod(2); }
            }, 
            {
                text: "年线",
                click: function () { chart.ChangePeriod(3); }
            },
            {
                text: "1分",
                click: function () { chart.ChangePeriod(4); }
            },
            {
                text: "5分",
                click: function () { chart.ChangePeriod(5); }
            },
            {
                text: "15分",
                click: function () { chart.ChangePeriod(6); }
            },
            {
                text: "30分",
                click: function () { chart.ChangePeriod(7); }
            },
            {
                text: "60分",
                click: function () { chart.ChangePeriod(8); }
            }
        ];

        if (chart.Period>=0 && chart.Period<data.length) data[chart.Period].selected=true;  //选中

        return data; 
    }

    this.GetRight=function(chart)
    {
        var data=
        [
            {
                text: "不复权",
                click: function () { chart.ChangeRight(0); }
            }, 
            {
                text: "前复权",
                click: function () { chart.ChangeRight(1); }
            }, 
            {
                text: "后复权",
                click: function () { chart.ChangeRight(2); }
            }
        ];

        if (chart.Right>=0 && chart.Right<data.length) data[chart.Right].selected=true;

        return data;
    }

    //指标
    this.GetIndex=function (chart) 
    {
        return [{
            text: "均线",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, '均线')
            }
        }, {
            text: "BOLL",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'BOLL')
            },
            isBorder:true
        }, {
            text: "MACD",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'MACD')
            }
        }, {
            text: "KDJ",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'KDJ')
            }
        }, {
            text: "VOL",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'VOL')
            }
        }, {
            text: "RSI",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'RSI')
            }
        }, {
            text: "BRAR",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'BRAR')
            }
        }, {
            text: "WR",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'WR')
            }
        }, {
            text: "BIAS",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'BIAS')
            }
        }, {
            text: "OBV",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'OBV')
            }
        }, {
            text: "DMI",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'DMI')
            }
        }, {
            text: "CR",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'CR')
            }
        }, {
            text: "PSY",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'PSY')
            }
        }, {
            text: "CCI",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'CCI')
            }
        }, {
            text: "DMA",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'DMA')
            }
        }, {
            text: "TRIX",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'TRIX')
            }
        }, {
            text: "VR",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'VR')
            }
        }, {
            text: "EMV",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'EMV')
            }
        }, {
            text: "ROC",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'ROC')
            }
        }, {
            text: "MIM",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'MIM')
            }
        }, {
            text: "FSL",
            click: function (windowIndex) {
                chart.ChangeIndex(windowIndex, 'FSL')
            }
        } ]
    }

    //五彩K线
    this.GetColorIndex=function (chart) 
    {
        var data=
        [
            {
                text: "十字星",
                click: function (windowIndex) { chart.ChangeInstructionIndex('五彩K线-十字星') }
            }, 
            {
                text: "早晨之星",
                click: function (windowIndex) { chart.ChangeInstructionIndex('五彩K线-早晨之星') },
            }, 
            {
                text: "垂死十字",
                click: function (windowIndex) { chart.ChangeInstructionIndex('五彩K线-垂死十字') },
            }, 
            {
                text: "三只乌鸦",
                click: function (windowIndex) { chart.ChangeInstructionIndex('五彩K线-三只乌鸦') }
            }, 
            {
                text: "光脚阴线",
                click: function (windowIndex) { chart.ChangeInstructionIndex('五彩K线-光脚阴线') }
            }, 
            {
                text: "黄昏之星",
                click: function (windowIndex) { chart.ChangeInstructionIndex('五彩K线-黄昏之星') }
            }
        ];

        if (chart.ColorIndex)
        {
            data[data.length-1].isBorder=true;
            data.push(
                {
                    text: "删除五彩K线",
                    click: function (windowIndex) { chart.CancelInstructionIndex() }
                });
        }

        return data;
    }

    //专家系统
    this.GetTradeIndex=function(chart)
    {
        var data=
        [
            {
                text: "BIAS",
                click: function (windowIndex) { chart.ChangeInstructionIndex('交易系统-BIAS') }
            }, 
            {
                text: "CCI",
                click: function (windowIndex) { chart.ChangeInstructionIndex('交易系统-CCI') }
            }, 
            {
                text: "DMI",
                click: function (windowIndex) { chart.ChangeInstructionIndex('交易系统-DMI') }
            }, 
            {
                text: "KD",
                click: function (windowIndex) { chart.ChangeInstructionIndex('交易系统-KD') }
            }, 
            {
                text: "BOLL",
                click: function (windowIndex) { chart.ChangeInstructionIndex('交易系统-BOLL') }
            }, 
            {
                text: "KDJ",
                click: function (windowIndex) { chart.ChangeInstructionIndex('交易系统-KDJ') }
            }
        ];

        if (chart.TradeIndex)
        {
            data[data.length-1].isBorder=true;
            data.push(
                {
                    text: "删除专家系统",
                    click: function (windowIndex) { chart.CancelInstructionIndex()}
                });
        }
        return data;
    }

    //叠加
    this.GetOverlay=function (chart)  
    {
        var data=
        [
            {
                text: "上证指数",
                click: function () { chart.OverlaySymbol('000001.sh'); }
            },
            {
                text: "深证成指",
                click: function () { chart.OverlaySymbol('399001.sz'); }
            }, 
            {
                text: "中小板指",
                click: function () { chart.OverlaySymbol('399005.sz'); }
            }, 
            {
                text: "创业板指",
                click: function () { chart.OverlaySymbol('399006.sz'); }
            }, 
            {
                text: "沪深300",
                click: function () { chart.OverlaySymbol('000300.sh'); },
            }
        ];

        if (chart.OverlayChartPaint && chart.OverlayChartPaint[0] && chart.OverlayChartPaint[0].Symbol)
        {
            var symbol=chart.OverlayChartPaint[0].Symbol;
            const mapSymbol=new Map(
                [
                    ['000001.sh',0],['399001.sz',1],['399005.sz',2],['399006.sz',3],['000300.sh',4]
                ]);
            if (mapSymbol.has(symbol)) data[mapSymbol.get(symbol)].selected=true;

            data[data.length-1].isBorder=true;
            data.push(
                {
                    text: "取消叠加",
                    click: function () { chart.ClearOverlaySymbol();}
                }
            );
        }

        return data;
    }

    //K线类型设置
    this.GetKLineType=function(chart)
    {
        var data=
        [
            {
                text: "K线(空心阳线)",
                click: function () { chart.ChangeKLineDrawType(3);}
            },
            {
                text: "K线(实心阳线)",
                click: function () { chart.ChangeKLineDrawType(0); }
            }, 
            {
                text: "美国线",
                click: function () { chart.ChangeKLineDrawType(2); }
            }, 
            {
                text: "收盘线",
                click: function () { chart.ChangeKLineDrawType(1); }
            }
        ];

        switch(chart.KLineDrawType)
        {
            case 0:
                data[1].selected=true;
                break;
            case 1:
                data[3].selected=true;
                break;
            case 2:
                data[2].selected=true;
                break;
            case 3:
                data[0].selected=true;
                break;
        }
        return data;
    }

    //指标窗口个数
    this.GetIndexWindowCount=function(chart)
    {
        var data=
        [
            {
                text: "1个窗口",
                click: function () { chart.ChangeIndexWindowCount(1); }
            },
            {
                text: "2个窗口",
                click: function () { chart.ChangeIndexWindowCount(2); }
            }, 
            {
                text: "3个窗口",
                click: function () { chart.ChangeIndexWindowCount(3); }
            }, 
            {
                text: "4个窗口",
                click: function () { chart.ChangeIndexWindowCount(4); }
            },
            {
                text: "5个窗口",
                click: function () { chart.ChangeIndexWindowCount(5); }
            }
        ];

        var count=chart.Frame.SubFrame.length;
        if ((count-1)>=0 && (count-1)<data.length) data[count-1].selected=true;  //选中

        return data;
    }

    //坐标类型
    this.GetCoordinateType=function(chart)
    {
        var data= 
        [
            {
                text: "普通坐标",
                click: function () { chart.ChangeCoordinateType(0); }
            },
            {
                text: "百分比坐标",
                click: function () { chart.ChangeCoordinateType(1); }
            },
            {
                text: "反转坐标",
                click: function () { chart.ChangeCoordinateType(2); }
            }
        ];

        if (chart.Frame && chart.Frame.SubFrame && chart.Frame.SubFrame.length>0) 
        {
            if (chart.Frame.SubFrame[0].Frame.CoordinateType==1) data[2].selected=true;
            else data[0].selected=true;

            if (chart.Frame.SubFrame[0].Frame.YSplitOperator.CoordinateType==1) data[1].selected=true;
        }

        return data;
    }

    //拖拽模式
    this.GetDragModeType=function(chart)
    {
        var data=
        [
            {
                text: "禁止拖拽",
                click: function () { chart.DragMode=0; }
            },
            {
                text: "启动拖拽",
                click: function () { chart.DragMode=1; }
            },
            {
                text: "区间选择",
                click: function () { chart.DragMode=2; }
            }
        ];

        if (chart.DragMode>=0 && chart.DragMode<data.length) data[chart.DragMode].selected=true;  //选中

        return data;
    }

    //工具
    this.GetTools=function(chart)
    {
        var data=[];
        var drawTools=chart.GetExtendChartByClassName('DrawToolsButton');
        if (drawTools)
        {
            data.push(
                {
                    text: "关闭画图工具",
                    click: function () { 
                        chart.DeleteExtendChart(drawTools); 
                        if (drawTools.Chart.IsAutoIndent==1)
                        {
                            chart.Frame.ChartBorder.Right-=drawTools.Chart.ToolsWidth;
                            chart.SetSizeChage(true);
                            chart.Draw();
                        }
                    }
                }
            );
        }
        else
        {
            data.push(
                {
                    text: "画图工具",
                    click: function () {
                        var option={Name:'画图工具', Top:chart.Frame.ChartBorder.Top ,IsAutoIndent:1};
                        var extendChart=chart.CreateExtendChart(option.Name, option);   //创建扩展图形
                        chart.Frame.ChartBorder.Right+=extendChart.ToolsWidth;
                        chart.SetSizeChage(true);
                        chart.Draw();
                    }
                }
            );
        }

        var StockChip=chart.GetExtendChartByClassName('StockChip');
        if (StockChip)
        {
            data.push(
                {
                    text: "关闭移动筹码",
                    click: function () { 
                        chart.DeleteExtendChart(StockChip); 
                        if (StockChip.Chart.IsAutoIndent==1)
                        {
                            chart.Frame.ChartBorder.Right-=chart.StockChipWidth;
                            chart.SetSizeChage(true);
                            chart.Draw();
                        }
                    }
                }
            );
        }
        else
        {
            data.push(
                {
                    text: "移动筹码",
                    click: function () {  
                        var option={Name:'筹码分布', IsAutoIndent:1, ShowType:1};
                        var extendChart=chart.CreateExtendChart(option.Name, option);   //创建扩展图形
                        chart.Frame.ChartBorder.Right+=chart.StockChipWidth;
                        chart.SetSizeChage(true);
                        chart.Draw();
                    }
                }
            );
        }

        return data;
    }

    this.GetKLineInfo=function(chart)
    {
        var setInfo=new Set();
        for(var i in chart.ChartInfo)
        {
            var item=chart.ChartInfo[i];
            setInfo.add(item.ClassName);
        }

        var aryKLineInfo=["公告","业绩预告","调研","大宗交易","龙虎榜","互动易"]

        var data=[];
        for(var i in aryKLineInfo)
        {
            var infoName=aryKLineInfo[i];
            var classInfo=JSKLineInfoMap.GetClassInfo(infoName);
            if (!classInfo) continue;
            
            var item=this.CreateKlineInfoItem(infoName, setInfo.has(classInfo.ClassName), chart);
            data.push(item);
        }

        if (chart.ChartInfo.length>0)
        {
            data[data.length-1].isBorder=true;
            var item={ text:'删除所有', click:function() { chart.ClearKLineInfo()} };
            data.push(item);
           
        }

        return data;
    }

    this.CreateKlineInfoItem=function(infoName,bExist,chart)
    {
        var item= 
        {
            text:infoName, 
            selected:bExist
        }

        if (bExist) item.click=function() { chart.DeleteKLineInfo(infoName) };
        else  item.click=function() { chart.AddKLineInfo(infoName,true) }

        return item;
    }

    this.DoModal=function(event)
    {
        var chart=event.data.Chart;
        var rightMenu=chart.RightMenu;
        var x = event.offsetX;
        var y = event.offsetY;

        var dataList=[{
            text: "分析周期",
            children: this.GetPeriod(chart)
        }, 
        {
            text: "复权处理",
            children: this.GetRight(chart)
        }, 
        {
            text: "指标切换",
            children: this.GetIndex(chart)
        }, 
        {
            text:"五彩K线",
            children: this.GetColorIndex(chart)
        },
        {
            text:'专家系统',
            children: this.GetTradeIndex(chart)
        },
        {
            text:'信息地雷',
            children: this.GetKLineInfo(chart)
        },
        {
            text: "叠加品种",
            children: this.GetOverlay(chart)
        },
        {
            text:'主图线型',
            children: this.GetKLineType(chart)
        },
        {
            text:"坐标类型",
            children:this.GetCoordinateType(chart)
        },
        {
            text:'指标窗口个数',
            children: this.GetIndexWindowCount(chart)
        },
        {
            text:'鼠标拖拽',
            children: this.GetDragModeType(chart)
        },
        {
            text:"工具",
            children:this.GetTools(chart)
        }
        ];

        if(IsIndexSymbol(chart.Symbol)){
            dataList.splice(1,1);
        }

        var identify=event.data.FrameID;
        console.log('[KLineRightMenu::DoModal]',identify);
        rightMenu.Show({
            windowIndex :identify,
            x:x+chart.UIElement.offsetLeft,
            y:y+chart.UIElement.offsetTop,
            position:chart.Frame.Position,
            data:dataList
        })

        $(document).click(function () {
            rightMenu.Hide();
        });
    }
}

//K线区间选择右键菜单
function KLineSelectRightMenu(divElement)
{
    this.newMethod=KLineRightMenu;   //派生
    this.newMethod(divElement);
    delete this.newMethod;

    this.DoModal=function(event)
    {
        var chart=event.data.Chart;
        var rightMenu=this;
        var x = event.data.X;
        var y = event.data.Y;

        var dataList=
        [
            {
                text: "区间统计",
                click: function () 
                {
                    console.log('[KLineSelectRightMenu::click] 区间统计');
                    var dialog=new KLineSelectRectDialog(divElement);
                    dialog.DoModal(event);
                }
            } 
        ];

        rightMenu.Show({
            x:x,
            y:y,
            position:chart.Frame.Position,
            data:dataList
        });
    }

    this.Show=function (obj) 
    {
        var _self = this;
        $.extend(_self.option, obj);

        //判断是否重复创建
        if (!_self.ID) _self.Create();

        var $topMenu = $("#topMenu_"+_self.ID),
            topWidth = $topMenu.outerWidth(),
            topHeight = $topMenu.outerHeight();

        var x = _self.option.x,
            y = _self.option.y;

        if (topWidth > _self.option.position.X + _self.option.position.W- x) //超过了右边距
            x = x - topWidth;

        if (topHeight > _self.option.position.Y +_self.option.position.H - y)//超过了下边距
            y = y - topHeight;

        $topMenu.hide();
        $topMenu.css({ position:"absolute",left: x + "px", top: y + "px" }).show();

        $("#topMenu_" + _self.ID).find("tr").show();    //把菜单列表显示

        this.isInit = true;
    }
}

//分钟数据右键菜单
function MinuteRightMenu(divElement)
{
    this.newMethod=KLineRightMenu;   //派生
    this.newMethod(divElement);
    delete this.newMethod;

    this.DoModal=function(event)
    {
        var chart=event.data.Chart;
        var rightMenu=chart.RightMenu;
        var x = event.offsetX;
        var y = event.offsetY;

        var dataList=
        [
            {
                text: "叠加品种",
                children: this.GetOverlay(chart)
            },
            {
                text: "多日分时图",
                children: this.GetDayCount(chart)
            },
            {
                text: "副图指标切换",
                children: this.GetIndex(chart)
            }
        ];

        var identify=event.data.FrameID;
        console.log('[MinuteRightMenu::DoModal]',identify);
        rightMenu.Show({
            windowIndex :identify,
            x:x+chart.UIElement.offsetLeft,
            y:y+chart.UIElement.offsetTop,
            position:chart.Frame.Position,
            data:dataList
        })

        $(document).click(function () {
            rightMenu.Hide();
        });
    }

    this.GetDayCount=function(chart)
    {
        var data=
        [
            {
                text: "当日分时图",
                click: function () { chart.ChangeDayCount(1); },
                isBorder:true
            }, 
            {
                text: "最近2日",
                click: function () { chart.ChangeDayCount(2); }
            }, 
            {
                text: "最近3日",
                click: function () { chart.ChangeDayCount(3); }
            },
            {
                text: "最近4日",
                click: function () { chart.ChangeDayCount(4); }
            },
            {
                text: "最近5日",
                click: function () { chart.ChangeDayCount(5); }
            },
            {
                text: "最近6日",
                click: function () { chart.ChangeDayCount(6); }
            }
        ];
        
        if ((chart.DayCount-1)>=0 && (chart.DayCount-1)<data.length) data[chart.DayCount-1].selected=true;

        return data;
    }

    this.GetIndex=function (chart) 
    {
        var data=
        [
            {
                text: "MACD",
                click: function (windowIndex) { chart.ChangeIndex(windowIndex, 'MACD') }
            }, 
            {
                text: "DMI",
                click: function (windowIndex) { chart.ChangeIndex(windowIndex, 'DMI') }
            },
            {
                text: "DMA",
                click: function (windowIndex) { chart.ChangeIndex(windowIndex, 'DMA') }
            }, 
            {
                text: "BRAR",
                click: function (windowIndex) { chart.ChangeIndex(windowIndex, 'BRAR') }
            }, 
            {
                text: "KDJ",
                click: function (windowIndex) { chart.ChangeIndex(windowIndex, 'KDJ') }
            }, 
            {
                text: "RSI",
                click: function (windowIndex) { chart.ChangeIndex(windowIndex, 'RSI') }
            }, 
            {
                text: "WR",
                click: function (windowIndex) { chart.ChangeIndex(windowIndex, 'WR') }
            },  
            {
                text: "CCI",
                click: function (windowIndex) { chart.ChangeIndex(windowIndex, 'CCI') }
            },
            {
                text: "TRIX",
                click: function (windowIndex) { chart.ChangeIndex(windowIndex, 'TRIX') }
            }
        ];

        return data;
    }
}

//画图工具 单个图形设置
function ChartPictureSettingMenu(divElement)
{
    this.newMethod=IDivDialog;   //派生
    this.newMethod(divElement);
    delete this.newMethod;

    this.HQChart;
    this.ChartPicture;
    this.SubToolsDiv;
    this.SettingMenu;

    this.DoModal=function(event)
    {
        var $body;
        if (!this.SubToolsDiv)
        {
            this.ID=Guid();
            var div=document.createElement("div");
            div.className='subTolls';
            div.id=this.ID;
            this.DivElement.appendChild(div);
            //$body = $("."+event.data.HQChart.ClassName).context.body;
            //$body.append(div);
            this.SubToolsDiv=div;
        }
        this.HQChart=event.data.HQChart;
        this.ChartPicture=event.data.ChartPicture;

        var frame=this.HQChart.Frame.SubFrame[0].Frame;
        // var top=frame.ChartBorder.GetTopTitle();
        var top=frame.ChartBorder.Top + 40;
        // var right=frame.ChartBorder.GetRight();
        var right=frame.ChartBorder.Right;
        var left=frame.ChartBorder.GetLeft();
        var className = this.ChartPicture.ClassName; //='ChartDrawPictureText'时加“设置”
        var toolsDiv = "";
        if(className === 'ChartDrawPictureText'){
            toolsDiv = '<span class="changes-color" title="改变图形颜色">'+
                           '<i class="iconfont icon-bianji"></i>'+
                           '<input type="color" name="color" id="color" class="change-color" value="'+ this.ChartPicture.LineColor +'">'+
                        '</span>\n' +
                        '<span class="subtool-set" title="设置"><i class="iconfont icon-shezhi"></i></span>'+
                        '<span class="subtool-del"><i class="iconfont icon-recycle_bin"></i></span>';
        }else{
            toolsDiv =
            '<p class="changes-color" title="改变图形颜色"><i class="iconfont icon-bianji"></i>' +
            '<input type="color" name="color" id="color" class="change-color" value="'+ this.ChartPicture.LineColor +'"></p>\n' +
            '        <p class="subtool-del"><i class="iconfont icon-recycle_bin"></i></p>';
        }

        this.SubToolsDiv.style.right = right + "px";
        this.SubToolsDiv.style.top = top + "px";
        this.SubToolsDiv.innerHTML = toolsDiv;
        this.SubToolsDiv.style.position = "absolute";
        this.SubToolsDiv.style.display = "block";

        var hqChart = this.HQChart;
        var picture = this.ChartPicture;
        var subToolDiv = this.SubToolsDiv;
        $(".subtool-del").click(function(){
            hqChart.ClearChartDrawPicture(picture);
            // subToolDiv.innerHTML = "";
            $(".subTolls").css("display","none");
        });
        var self = this;
        $(".subtool-set").click(function(){
            $(self.SubToolsDiv).hide();
            //创建div设置窗口
            if (!this.SettingMenu) self.SettingMenu=new ChartPictureTextSettingMenu(frame.ChartBorder.UIElement.parentNode);

            self.SettingMenu.ChartPicture=picture;
            self.SettingMenu.Position={Left:right + 80,Top:top + 20};
            self.SettingMenu.DoModal();
        });
        $(".changes-color").click(function () {
            document.getElementById('color').click();
            $(".change-color").change(function () {
                var color = $(".change-color").val();
                picture.LineColor = color;
                picture.PointColor = color;
            });
        })


        console.log("[ChartPictureSettingMenu::DoModal]", {Top:top,Left:left, Right:right});
    }
}

//画图工具 文本设置窗口
function ChartPictureTextSettingMenu(divElement)
{
    this.newMethod=IDivDialog;   //派生
    this.newMethod(divElement);
    delete this.newMethod;

    this.ChartPicture;
    this.SettingDiv;
    this.Position;

    this.BackupData;    //画图工具备份数据

    this.Close=function()   
    {
        if (this.SettingDiv) this.DivElement.removeChild(this.SettingDiv);  //直接删除
    }

    this.DoModal=function()
    {
        var text=this.ChartPicture.Text;    //显示的文本
        var fontOption=this.ChartPicture.FontOption;    //字体设置
        var lineColor=this.ChartPicture.LineColor;
        //数据备份, 点取消的时候把备份数据设置回去
        this.BackupData=
        {
            Text:text, 
            LineColor:lineColor,
            FontOption:{Family: fontOption.Family, Size: fontOption.Size, Weight: fontOption.Weight, Style: fontOption.Style }
        };
        console.log('[ChartPictureTextSettingMenu::DoModal] picture info',this.BackupData);

        var self=this;
        var div=this.DivElement.getElementsByClassName('chartpicture-text-setting')[0];
        if (!div)
        {
            div=document.createElement("div");
            div.className='chartpicture-text-setting';
            this.DivElement.appendChild(div);
            this.SettingDiv=div;
        }
        else 
        {
            this.SettingDiv=div;
        }
        
        var titleContainerStr = '<div class="titleWrap">'+
                                    '<span class="titleName">样式设置</span>'+
                                    '<i class="closeBtn iconfont icon-close"></i>'+
                                '</div>';
                            
        var fontSizeArray = [10,11,12,14,16,20,24,28,32,40];
        var fontArray = ['微软雅黑','宋体','Arial','仿宋'];
        var sizeListStr = "";
        var fontListStr = "";
        fontArray.forEach(function(item,index){
            fontListStr += index !== 0 ? '<p>'+item+'</P>' : '<p class="active">'+item+'</P>';
        });
        fontSizeArray.forEach(function(item,index){
            sizeListStr += index !== 5 ? '<p>'+item+'</P>' : '<p class="active">'+item+'</P>';
        });
        var contentContainerStr = '<div class="contentWrap">'+
                                    '<div class="styleOptions">'+
                                        '<span class="colorPicker"><input type="color" id="fontColor" value="#1e90ff"></span>'+
                                        '<div class="likeSelect fontSelect"><span class="choicedText">微软雅黑</span><div class="selectList">'+fontListStr+'</div><i class="iconfont icon-xia"></i></div>'+
                                        '<div class="likeSelect fontSizeSelect"><span class="choicedText">20</span><div class="selectList">'+sizeListStr+'</div><i class="iconfont icon-xia"></i></div>'+
                                        '<span class="strongFont likeBtn"><i class="iconfont icon-jiacu"></i></span>'+
                                        '<span class="italicsFont likeBtn"><i class="iconfont icon-qingxieL"></i></span>'+
                                    '</div>'+
                                    '<textarea class="tArea" id="tArea" placeholder="Text"></textarea>'+
                                  '</div>';
        var btnContainer = '<div class="btnsContainer">'+
                                '<span class="okBtn btn">确认</span>'+
                                '<span class="cancelBtn btn">取消</span>'+
                            '</div>';
        var DoModalStr = titleContainerStr+contentContainerStr+btnContainer;
        this.SettingDiv.style.left = this.Position.Left + "px";
        this.SettingDiv.style.top = this.Position.Top + "px";
        this.SettingDiv.innerHTML=DoModalStr;
        this.SettingDiv.style.position = "absolute";
        this.SettingDiv.style.display = "block";
        $(".chartpicture-text-setting .colorPicker").css({ //初始设置
            "borderColor":self.ChartPicture.LineColor,
            "background-color":self.ChartPicture.LineColor
        });

        var family = this.ChartPicture.FontOption.Family;
        $('.chartpicture-text-setting .fontSelect .choicedText').html(family);
        fontArray.forEach(function(item,index){
            if(item == family){
                $('.chartpicture-text-setting .fontSelect p').removeClass('active');
                $('.chartpicture-text-setting .fontSelect p').eq(index).addClass('active');
            }
        });

        var size = this.ChartPicture.FontOption.Size;
        $('.chartpicture-text-setting .fontSizeSelect .choicedText').html(size);
        fontSizeArray.forEach(function(item,index){
            if(item == size){
                $('.chartpicture-text-setting .fontSizeSelect p').removeClass('active');
                $('.chartpicture-text-setting .fontSizeSelect p').eq(index).addClass('active');
            }
        });

        var weight = this.ChartPicture.FontOption.Weight;
        if( weight != null && weight == 'bold'){
            $('.chartpicture-text-setting .strongFont').addClass('hot');
        }

        var style = this.ChartPicture.FontOption.Style;
        if( style != null && style == 'italic'){
            $('.chartpicture-text-setting .italicsFont').addClass('hot');
        }

        var text = this.ChartPicture.Text;
        $('.chartpicture-text-setting .tArea').val(text);  //结束初始设置

        var defaultTextOption = { Family:'微软雅黑', Size:20, Weight:null, Style:null };
        $(".chartpicture-text-setting #fontColor").change(
            {
                Picture:this.ChartPicture
            },
            function(event)
            {  //颜色选择
                var value = $(this).val();
                $(this).parent().css({
                    "borderColor":value,
                    "background-color":value
                });
                var chart=event.data.Picture;
                chart.LineColor = value;
                if (chart.Update) chart.Update();   //更新界面
            }
        );
        $(".chartpicture-text-setting .fontSelect,.chartpicture-text-setting .fontSizeSelect").click(function(){
            $(this).find('.selectList').toggle();
            $(this).toggleClass('hot');
        });
        $(".chartpicture-text-setting .fontSelect p").click(
            {
                Picture:this.ChartPicture
            },
            function(event){ //字体选择
                var choicedText = $(this).closest(".fontSelect").find('.choicedText').html();
                var currentSelect = event.currentTarget.innerHTML;
                if(choicedText !== currentSelect){
                    $(this).closest(".fontSelect").find('.choicedText').html(currentSelect);
                    $(this).siblings().removeClass('active');
                    $(this).addClass('active');
                    var chart = event.data.Picture;
                    chart.FontOption.Family = currentSelect;
                    if (chart.Update) chart.Update();   //更新界面
                }
        });
        $(".chartpicture-text-setting .fontSizeSelect p").click(
            {
                Picture:this.ChartPicture
            },
            function(event){  //字号选择
            var choicedText = $(this).closest(".fontSizeSelect").find('.choicedText').html();
            var currentSelect = event.currentTarget.innerHTML;
            if(choicedText !== currentSelect){
                $(this).closest(".fontSizeSelect").find('.choicedText').html(currentSelect);
                $(this).siblings().removeClass('active');
                $(this).addClass('active');
                var chart = event.data.Picture;
                chart.FontOption.Size = Number(currentSelect);
                if (chart.Update) chart.Update();   //更新界面
            }
        });
        $(".chartpicture-text-setting .strongFont").click(
            {
                Picture:this.ChartPicture
            },
            function(event){
            $(this).toggleClass('hot');
            var classnames = $(this).attr('class');
            if(classnames.indexOf('hot') > 0){
                var chart = event.data.Picture;
                chart.FontOption.Weight = 'bold';
                if (chart.Update) chart.Update();   //更新界面
            }
        });
        $(".chartpicture-text-setting .italicsFont").click(
            {
                Picture:this.ChartPicture
            },
            function(event){
            $(this).toggleClass('hot')
            var classnames = $(this).attr('class');
            if(classnames.indexOf('hot') > 0){
                var chart = event.data.Picture;
                chart.FontOption.Style = 'italic';
                if (chart.Update) chart.Update();   //更新界面
            }
        });
        $(".chartpicture-text-setting .titleWrap .closeBtn,.chartpicture-text-setting .btnsContainer .cancelBtn").click(  //取消
            {
                Picture:this.ChartPicture
            },
            function(event){
                var picture = event.data.Picture;
                picture.Text = self.BackupData.Text;
                picture.LineColor = self.BackupData.LineColor;
                picture.FontOption = self.BackupData.FontOption;
                if (picture.Update) picture.Update();
                self.Close();
        });
        $(".chartpicture-text-setting .tArea").keyup( //文本内容
            {
                Picture:this.ChartPicture
            },
            function(event){
                console.log("更改中。。。");
                var content = $(this).val();
                var chart = event.data.Picture;
                chart.Text = content;
                if (chart.Update) chart.Update();   //更新界面
        });

        //确定按钮
        $(".chartpicture-text-setting .btnsContainer .okBtn").click(
            function()
            {  
                self.Close(); 
            }
        );
    }
}



///////////////////////////////////////////////////////////////////////////////////////
//
//  各个品种分钟走势图坐标信息
//
//////////////////////////////////////////////////////////////////////////////////////
var MARKET_SUFFIX_NAME=
{
    SH:'.SH',
    SZ:'.SZ',
    HK:'.HK',
    SHFE: '.SHF',        //上期所 (Shanghai Futures Exchange)
    CFFEX: '.CFE',       //中期所 (China Financial Futures Exchange)
    DCE: '.DCE',         //大连商品交易所(Dalian Commodity Exchange)
    CZCE: '.CZC',        //郑州期货交易所

    IsSH: function (upperSymbol)
    {
        //需要精确匹配最后3位
        var pos = upperSymbol.length-this.SH.length;
        var find = upperSymbol.indexOf(this.SH);
        return find == pos;
    },

    IsSZ: function (upperSymbol)
    {
        var pos = upperSymbol.length - this.SZ.length;
        var find = upperSymbol.indexOf(this.SZ);
        return find == pos;
    },

    IsHK: function (upperSymbol)
    {
        var pos = upperSymbol.length - this.HK.length;
        var find = upperSymbol.indexOf(this.HK);
        return find == pos;
    },

    IsSHFE: function (upperSymbol)
    {
        return upperSymbol.indexOf(this.SHFE) > 0;
    },
        
    IsCFFEX: function (upperSymbol) 
    {
        return upperSymbol.indexOf(this.CFFEX) > 0;
    },

    IsDCE: function (upperSymbol) 
    {
        return upperSymbol.indexOf(this.DCE) > 0;
    },

    IsCZCE: function (upperSymbol) 
    {
        return upperSymbol.indexOf(this.CZCE) > 0;
    },

    IsChinaFutures:function(upperSymbol)   //是否是国内期货
    {
        return this.IsCFFEX(upperSymbol) || this.IsCZCE(upperSymbol) || this.IsDCE(upperSymbol) || this.IsSHFE(upperSymbol);
    },

    IsSHSZ:function(upperSymbol)            //是否是沪深的股票
    {
        return this.IsSZ(upperSymbol)|| this.IsSH(upperSymbol);
    },

    IsSHSZFund:function(upperSymbol)        //是否是交易所基金
    {
        if (!upperSymbol) return false;

        if (this.IsSH(upperSymbol)) //51XXXX.SH
        {
            if (upperSymbol.charAt(0)=='5' && upperSymbol.charAt(1)=='1') return true;
        }
        else if (this.IsSZ(upperSymbol)) //15XXXX.sz, 16XXXX.sz, 17XXXX.sz, 18XXXX.sz
        {
            if (upperSymbol.charAt(0)=='1' && 
                (upperSymbol.charAt(1)=='5' || upperSymbol.charAt(1)=='6' || upperSymbol.charAt(1)=='7' || upperSymbol.charAt(1)=='8') ) return true;
        }

        return false;
    },

    IsSHSZIndex:function(symbol)     //是否是沪深指数代码
    {
        if (!symbol) return false;
        var upperSymbol=symbol.toUpperCase();
        if (this.IsSH(upperSymbol))
        {
            var temp=upperSymbol.replace('.SH','');
            if (upperSymbol.charAt(0)=='0' && parseInt(temp)<=3000) return true;

        }
        else if (this.IsSZ(upperSymbol))
        {
            if (upperSymbol.charAt(0)=='3' && upperSymbol.charAt(1)=='9') return true;
        }
        else if (upperSymbol.indexOf('.CI')>0)  //自定义指数
        {
            return true;
        }

        return false;
    }
}


//走势图分钟数据对应的时间
function MinuteTimeStringData() 
{
    this.SHSZ = null;       //上海深证交易所时间
    this.HK = null;         //香港交易所时间
    this.Futures=new Map(); //期货交易时间 key=时间名称 Value=数据
    this.USA = null;        //美股交易时间

    this.Initialize = function ()  //初始化 默认只初始化沪深的 其他市场动态生成
    {
        //this.SHSZ = this.CreateSHSZData();
        //this.HK = this.CreateHKData();
    }

    this.GetSHSZ=function() //动态创建
    {
        if (!this.SHSZ) this.SHSZ=this.CreateSHSZData();
        return this.SHSZ;
    }

    this.GetHK=function()
    {
        if (!this.HK) this.HK = this.CreateHKData();
        return this.HK;
    }

    this.GetFutures=function(splitData)
    {
        if (!this.Futures.has(splitData.Name)) 
        {
            var data = this.CreateTimeData(splitData.Data);
            this.Futures.set(splitData.Name,data);
        }
        
        return this.Futures.get(splitData.Name);
    }

    this.GetUSA=function()
    {
        if (!this.USA) this.USA=this.CreateUSAData();
        return this.USA;
    }

    this.CreateSHSZData = function () 
    {
        const TIME_SPLIT =
            [
                { Start: 925, End: 925 },
                { Start: 930, End: 1130 },
                { Start: 1300, End: 1500 }
            ];

        return this.CreateTimeData(TIME_SPLIT);
    }

    this.CreateHKData = function () 
    {
        const TIME_SPLIT =
            [
                { Start: 930, End: 1200 },
                { Start: 1300, End: 1600 }
            ];

        return this.CreateTimeData(TIME_SPLIT);
    }

    this.CreateUSAData=function()
    {
        //美国夏令时
        const TIME_SUMMER_SPLIT =
            [
                { Start: 2130, End: 2359 },
                { Start: 0, End: 400 }
            ];
            
        //非夏令时
        const TIME_SPLIT =
            [
                { Start: 2230, End: 2359 },
                { Start: 0, End: 500 }
            ];

        return this.CreateTimeData(TIME_SPLIT); 
    }

    this.CreateTimeData = function (timeSplit) 
    {
        var data = [];
        for (var i in timeSplit) 
        {
            var item = timeSplit[i];
            for (var j = item.Start; j <= item.End; ++j) 
            {
                if (j % 100 >= 60) continue;    //大于60分钟的数据去掉
                data.push(j);
            }
        }
        return data;
    }

    this.GetTimeData = function (symbol) 
    {
        if (!symbol) return this.SHSZ;

        var upperSymbol = symbol.toLocaleUpperCase(); //转成大写
        if (MARKET_SUFFIX_NAME.IsSH(upperSymbol) || MARKET_SUFFIX_NAME.IsSZ(upperSymbol)) return this.GetSHSZ();
        if (MARKET_SUFFIX_NAME.IsHK(upperSymbol)) return this.GetHK();
        if (MARKET_SUFFIX_NAME.IsCFFEX(upperSymbol) || MARKET_SUFFIX_NAME.IsCZCE(upperSymbol) || MARKET_SUFFIX_NAME.IsDCE(upperSymbol) || MARKET_SUFFIX_NAME.IsSHFE(upperSymbol))
        {
            var splitData = g_FuturesTimeData.GetSplitData(upperSymbol);
            if (!splitData) return null;
            return this.GetFutures(splitData);
        }
    }
}

//走势图刻度分钟线
function MinuteCoordinateData() 
{
    //沪深走势图时间刻度
    const SHZE_MINUTE_X_COORDINATE =
        {
            Full:   //完整模式
            [
                [0, 0, "rgb(200,200,200)", "09:30"],
                [31, 0, "RGB(200,200,200)", "10:00"],
                [61, 0, "RGB(200,200,200)", "10:30"],
                [91, 0, "RGB(200,200,200)", "11:00"],
                [122, 1, "RGB(200,200,200)", "13:00"],
                [152, 0, "RGB(200,200,200)", "13:30"],
                [182, 0, "RGB(200,200,200)", "14:00"],
                [212, 0, "RGB(200,200,200)", "14:30"],
                [242, 1, "RGB(200,200,200)", "15:00"], // 15:00
            ],
            Simple: //简洁模式
            [
                [0, 0, "rgb(200,200,200)", "09:30"],
                [61, 0, "RGB(200,200,200)", "10:30"],
                [122, 1, "RGB(200,200,200)", "13:00"],
                [182, 0, "RGB(200,200,200)", "14:00"],
                [242, 1, "RGB(200,200,200)", "15:00"]
            ],
            Min:   //最小模式     
            [
                [0, 0, "rgb(200,200,200)", "09:30"],
                [122, 1, "RGB(200,200,200)", "13:00"],
                [242, 1, "RGB(200,200,200)", "15:00"]
            ],

            Count: 243,
            MiddleCount: 122,

            GetData: function (width) 
            {
                if (width < 200) return this.Min;
                else if (width < 400) return this.Simple;

                return this.Full;
            }
        };

    //港股走势图时间刻度
    const HK_MINUTE_X_COORDINATE =
        {
            Full:   //完整模式
            [
                [0, 1, "RGB(200,200,200)", "09:30"],
                [30, 0, "RGB(200,200,200)", "10:00"],
                [60, 1, "RGB(200,200,200)", "10:30"],
                [90, 0, "RGB(200,200,200)", "11:00"],
                [120, 1, "RGB(200,200,200)", "11:30"],
                [151, 0, "RGB(200,200,200)", "13:00"],
                [181, 1, "RGB(200,200,200)", "13:30"],
                [211, 0, "RGB(200,200,200)", "14:00"],
                [241, 1, "RGB(200,200,200)", "14:30"],
                [271, 0, "RGB(200,200,200)", "15:00"],
                [301, 1, "RGB(200,200,200)", "15:30"],
                [331, 1, "RGB(200,200,200)", "16:00"]
            ],
            Simple: //简洁模式
            [
                [0, 1, "RGB(200,200,200)", "09:30"],
                [60, 1, "RGB(200,200,200)", "10:30"],
                [120, 1, "RGB(200,200,200)", "11:30"],
                [211, 0, "RGB(200,200,200)", "14:00"],
                [271, 0, "RGB(200,200,200)", "15:00"],
                [331, 1, "RGB(200,200,200)", "16:00"]
            ],
            Min:   //最小模式     
            [
                [0, 1, "RGB(200,200,200)", "09:30"],
                [151, 0, "RGB(200,200,200)", "13:00"],
                [331, 1, "RGB(200,200,200)", "16:00"]
            ],

            Count: 332,
            MiddleCount: 151,

            GetData: function (width) 
            {
                if (width < 200) return this.Min;
                else if (width < 450) return this.Simple;

                return this.Full;
            }
        };

    this.GetCoordinateData = function (symbol, width) 
    {
        var data = null;
        if (!symbol) 
        {
            data = SHZE_MINUTE_X_COORDINATE;    //默认沪深股票
        }
        else 
        {
            var upperSymbol = symbol.toLocaleUpperCase(); //转成大写
            if (MARKET_SUFFIX_NAME.IsSH(upperSymbol) || MARKET_SUFFIX_NAME.IsSZ(upperSymbol))
                data = SHZE_MINUTE_X_COORDINATE;
            else if (MARKET_SUFFIX_NAME.IsHK(upperSymbol))
                data = HK_MINUTE_X_COORDINATE;
            else if (MARKET_SUFFIX_NAME.IsCFFEX(upperSymbol) || MARKET_SUFFIX_NAME.IsCZCE(upperSymbol) || MARKET_SUFFIX_NAME.IsDCE(upperSymbol) || MARKET_SUFFIX_NAME.IsSHFE(upperSymbol))
                return this.GetFuturesData(upperSymbol,width);
        }

        //console.log('[MiuteCoordinateData]', width);
        var result = { Count: data.Count, MiddleCount: data.MiddleCount, Data: data.GetData(width) };
        return result;
    }

    this.GetFuturesData = function (upperSymbol,width)
    {
        var splitData = g_FuturesTimeData.GetSplitData(upperSymbol);
        if (!splitData) return null;
        var stringData = g_MinuteTimeStringData.GetFutures(splitData);
        if (!stringData) return null;
        var result = { Count: stringData.length };
        var coordinate=null;
        var minWidth=200, simpleWidth=480;
        /*
        if (splitData.Name =='21:00-1:00,9:00-10:15,10:30-11:30,13:30-15:00')
        {
            minWidth=250;
            simpleWidth=500;
        }
        */
        
        if (width < minWidth) coordinate = splitData.Coordinate.Min;
        else if (width < simpleWidth) coordinate = splitData.Coordinate.Simple;
        else coordinate = splitData.Coordinate.Full;
        
        var data=[];
        for(var i=0;i<stringData.length;++i)
        {
            var value = stringData[i];
            for(var j=0;j<coordinate.length;++j)
            {
                var coordinateItem = coordinate[j];
                if (value == coordinateItem.Value)
                {
                    var item = [i, 0, 'RGB(200,200,200)', coordinateItem.Text];
                    data.push(item);
                    break;
                }
            }
        }

        result.Data = data;
        return result;
    }
}

//期货不同品种 交易时间数据 
function FuturesTimeData()
{
    const TIME_SPLIT=
    [
        {
            Name:'9:00-10:15,10:30-11:30,13:30-15:00',
            Data:
            [
                //9:00-10:15,10:30-11:30,13:30-15:00
                { Start: 900, End: 1015 },
                { Start: 1031, End: 1130 },
                { Start: 1331, End: 1500 }
            ],
            Coordinate:
            {
                Full://完整模式
                [
                    { Value: 900, Text: '9:00' },
                    { Value: 930, Text: '9:30' },
                    { Value: 1000, Text: '10:00' },
                    { Value: 1030, Text: '10:30' },
                    { Value: 1100, Text: '11:00' },
                    { Value: 1330, Text: '13:30' },
                    { Value: 1400, Text: '14:00' },
                    { Value: 1430, Text: '14:30' },
                    { Value: 1500, Text: '15:00' },
                ],
                Simple: //简洁模式
                [
                    { Value: 900, Text: '9:00' },
                    { Value: 1000, Text: '10:00' },
                    { Value: 1330, Text: '13:30' },
                    { Value: 1430, Text: '14:30' },
                    { Value: 1500, Text: '15:00' },
                ],
                Min:   //最小模式  
                [
                    { Value: 900, Text: '9:00' },
                    { Value: 1330, Text: '13:30' },
                    { Value: 1500, Text: '15:00' },
                ]
            }
        },
        {

            Name:'9:15-11:30,13:00-15:15',
            Data:
            [
                { Start: 915, End: 1130 },
                { Start: 1301, End: 1515 }
            ],
            Coordinate:
            {
                Full://完整模式
                [
                    { Value: 930, Text: '9:30' },
                    { Value: 1000, Text: '10:00' },
                    { Value: 1030, Text: '10:30' },
                    { Value: 1100, Text: '11:00' },
                    { Value: 1300, Text: '13:00' },
                    { Value: 1330, Text: '13:30' },
                    { Value: 1400, Text: '14:00' },
                    { Value: 1430, Text: '14:30' },
                    { Value: 1515, Text: '15:15' },
                ],
                Simple: //简洁模式
                [
                    { Value: 930, Text: '9:30' },
                    { Value: 1030, Text: '10:30' },
                    { Value: 1300, Text: '13:00' },
                    { Value: 1400, Text: '14:00' },
                    { Value: 1515, Text: '15:15' },
                ],
                Min:   //最小模式  
                [
                    { Value: 930, Text: '9:30' },
                    { Value: 1300, Text: '13:00' },
                    { Value: 1515, Text: '15:15' },
                ]
            }
        },
        {
            Name:'9:30-11:30,13:00-15:00',
            Data:
            [
                { Start: 930, End: 1130 },
                { Start: 1301, End: 1500 }
            ],
            Coordinate:
            {
                Full://完整模式
                [
                    { Value: 930, Text: '9:30' },
                    { Value: 1000, Text: '10:00' },
                    { Value: 1030, Text: '10:30' },
                    { Value: 1100, Text: '11:00' },
                    { Value: 1300, Text: '13:00' },
                    { Value: 1330, Text: '13:30' },
                    { Value: 1400, Text: '14:00' },
                    { Value: 1430, Text: '14:30' },
                    { Value: 1500, Text: '15:00' },
                ],
                Simple: //简洁模式
                [
                    { Value: 930, Text: '9:30' },
                    { Value: 1030, Text: '10:30' },
                    { Value: 1300, Text: '13:00' },
                    { Value: 1400, Text: '14:00' },
                    { Value: 1500, Text: '15:00' },
                ],
                Min:   //最小模式  
                [
                    { Value: 930, Text: '9:30' },
                    { Value: 1300, Text: '13:00' },
                    { Value: 1500, Text: '15:00' },
                ]
            }
        },
        {
            Name:'21:00-23:30,9:00-10:15,10:30-11:30,13:30-15:00',
            Data:
            [
                { Start: 2100, End: 2330 },
                { Start: 901, End: 1015 },
                { Start: 1031, End: 1130 },
                { Start: 1331, End: 1500 }
            ],
            Coordinate:
            {
                Full://完整模式
                [
                    { Value: 2100, Text: '21:00' },
                    { Value: 2200, Text: '22:00' },
                    { Value: 2300, Text: '23:00' },
                    { Value: 900, Text: '9:00' },
                    { Value: 1030, Text: '10:30' },
                    { Value: 1330, Text: '13:30' },
                    { Value: 1430, Text: '14:30' },
                    { Value: 1500, Text: '15:00' },
                ],
                Simple: //简洁模式
                [
                    { Value: 2100, Text: '21:00' },
                    { Value: 900, Text: '9:00' },
                    { Value: 1330, Text: '13:30' },
                    { Value: 1500, Text: '15:00' },
                ],
                Min:   //最小模式  
                [
                    { Value: 2100, Text: '21:00' },
                    { Value: 900, Text: '9:00' },
                    { Value: 1500, Text: '15:00' },
                ]
            }
        },
        {
            Name:'21:00-1:00,9:00-10:15,10:30-11:30,13:30-15:00',
            Data:
            [   
                { Start: 2100, End: 2359 },
                { Start: 0, End: 100 },
                { Start: 901, End: 1015 },
                { Start: 1031, End: 1130 },
                { Start: 1331, End: 1500 }
            ],
            Coordinate:
            {
                Full://完整模式
                [
                    { Value: 2100, Text: '21:00' },
                    { Value: 2200, Text: '22:00' },
                    { Value: 2300, Text: '23:00' },
                    { Value: 900, Text: '9:00' },
                    { Value: 1030, Text: '10:30' },
                    { Value: 1330, Text: '13:30' },
                    { Value: 1500, Text: '15:00' },
                ],
                Simple: //简洁模式
                [
                    { Value: 2100, Text: '21:00' },
                    { Value: 2300, Text: '23:00' },
                    { Value: 900, Text: '9:00' },
                    { Value: 1030, Text: '10:30' },
                    { Value: 1500, Text: '15:00' },
                ],
                Min:   //最小模式  
                [
                    { Value: 2100, Text: '21:00' },
                    { Value: 900, Text: '9:00' },
                    { Value: 1500, Text: '15:00' },
                ]
            }
        },
        {
            Name:'21:00-2:30,9:00-10:15,10:30-11:30,13:30-15:00',
            Data:
            [
                { Start: 2100, End: 2359 },
                { Start: 0, End: 230 },
                { Start: 901, End: 1015 },
                { Start: 1031, End: 1130 },
                { Start: 1331, End: 1500 }
            ],
            Coordinate:
            {
                Full://完整模式
                [
                    { Value: 2100, Text: '21:00' },
                    { Value: 2300, Text: '23:00' },
                    { Value: 100, Text: '1:00' },
                    { Value: 900, Text: '9:00' },
                    { Value: 1030, Text: '10:30' },
                    { Value: 1330, Text: '13:30' },
                    { Value: 1500, Text: '15:00' },
                ],
                Simple: //简洁模式
                [
                    { Value: 2100, Text: '21:00' },
                    { Value: 2300, Text: '23:00' },
                    { Value: 900, Text: '9:00' },
                    { Value: 1100, Text: '11:00' },
                    { Value: 1500, Text: '15:00' },
                ],
                Min:   //最小模式  
                [
                    { Value: 2100, Text: '21:00' },
                    { Value: 900, Text: '9:00' },
                    { Value: 1500, Text: '15:00' },
                ]
            }
        },
        {
            Name:'21:00-23:00,9:00-10:15,10:30-11:30,13:30-15:00',
            Data:
            [
                { Start: 2100, End: 2300 },
                { Start: 901, End: 1015 },
                { Start: 1031, End: 1130 },
                { Start: 1331, End: 1500 }
            ],
            Coordinate:
            {
                Full://完整模式
                [
                    { Value: 2100, Text: '21:00' },
                    { Value: 2200, Text: '22:00' },
                    { Value: 2300, Text: '23:00' },
                    { Value: 1030, Text: '10:30' },
                    { Value: 1330, Text: '13:30' },
                    { Value: 1430, Text: '14:30' },
                    { Value: 1500, Text: '15:00' },
                ],
                Simple: //简洁模式
                [
                    { Value: 2100, Text: '21:00' },
                    { Value: 2300, Text: '23:00' },
                    { Value: 1330, Text: '13:30' },
                    { Value: 1500, Text: '15:00' },
                ],
                Min:   //最小模式  
                [
                    { Value: 2100, Text: '21:00' },
                    { Value: 2300, Text: '23:00' },
                    { Value: 1500, Text: '15:00' },
                ]
            }
        }
    ];

    const MAP_TWOWORDS=new Map([
        //大连商品交易所
        [MARKET_SUFFIX_NAME.DCE + '-JD', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.DCE + '-FB', {Time:0,Decimal:2}],
        [MARKET_SUFFIX_NAME.DCE + '-BB', {Time:0,Decimal:2}],
        [MARKET_SUFFIX_NAME.DCE + '-PP', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.DCE + '-JM', {Time:3,Decimal:1}],
        //上期所
        [MARKET_SUFFIX_NAME.SHFE + '-CU', {Time:4,Decimal:0}],
        [MARKET_SUFFIX_NAME.SHFE + '-AL', {Time:4,Decimal:0}],
        [MARKET_SUFFIX_NAME.SHFE + '-NI', {Time:4,Decimal:0}],
        [MARKET_SUFFIX_NAME.SHFE + '-SN', {Time:4,Decimal:0}],
        [MARKET_SUFFIX_NAME.SHFE + '-ZN', {Time:4,Decimal:0}],
        [MARKET_SUFFIX_NAME.SHFE + '-PB', {Time:4,Decimal:0}],
        [MARKET_SUFFIX_NAME.SHFE + '-RU', {Time:6,Decimal:0}],
        [MARKET_SUFFIX_NAME.SHFE + '-FU', {Time:6,Decimal:0}],
        [MARKET_SUFFIX_NAME.SHFE + '-RB', {Time:6,Decimal:0}],
        [MARKET_SUFFIX_NAME.SHFE + '-BU', {Time:6,Decimal:0}],
        [MARKET_SUFFIX_NAME.SHFE + '-HC', {Time:6,Decimal:0}],
        [MARKET_SUFFIX_NAME.SHFE + '-WR', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.SHFE + '-AG', {Time:5,Decimal:0}],
        [MARKET_SUFFIX_NAME.SHFE + '-AU', {Time:5,Decimal:2}],
        //郑州期货交易所
        [MARKET_SUFFIX_NAME.CZCE + '-CF', {Time:3,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-SR', {Time:3,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-MA', {Time:3,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-ZC', {Time:3,Decimal:1}],
        [MARKET_SUFFIX_NAME.CZCE + '-TA', {Time:3,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-RM', {Time:3,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-OI', {Time:3,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-ME', {Time:3,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-FG', {Time:3,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-WS', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-WT', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-GN', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-RO', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-RS', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-ER', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-RI', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-WH', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-AP', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-PM', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-QM', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-TC', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-JR', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-LR', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-SF', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.CZCE + '-SM', {Time:0,Decimal:0}],
        //中期所 
        [MARKET_SUFFIX_NAME.CFFEX + '-TF', {Time:1,Decimal:3}],
        [MARKET_SUFFIX_NAME.CFFEX + '-TS', {Time:1,Decimal:3}],
        [MARKET_SUFFIX_NAME.CFFEX + '-IH', {Time:2,Decimal:1}],
        [MARKET_SUFFIX_NAME.CFFEX + '-IC', {Time:2,Decimal:1}],
        [MARKET_SUFFIX_NAME.CFFEX + '-IF', {Time:2,Decimal:1}],
    ]);

    const MAP_ONEWORD=new Map([
        //大连商品交易所
        [MARKET_SUFFIX_NAME.DCE + '-C', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.DCE + '-L', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.DCE + '-V', {Time:0,Decimal:0}],
        [MARKET_SUFFIX_NAME.DCE + '-A', {Time:3,Decimal:0}],
        [MARKET_SUFFIX_NAME.DCE + '-B', {Time:3,Decimal:0}],
        [MARKET_SUFFIX_NAME.DCE + '-M', {Time:3,Decimal:0}],
        [MARKET_SUFFIX_NAME.DCE + '-Y', {Time:3,Decimal:0}],
        [MARKET_SUFFIX_NAME.DCE + '-P', {Time:3,Decimal:0}],
        [MARKET_SUFFIX_NAME.DCE + '-J', {Time:3,Decimal:1}],
        [MARKET_SUFFIX_NAME.DCE + '-I', {Time:3,Decimal:1}],
        //中期所 
        [MARKET_SUFFIX_NAME.CFFEX + '-T', {Time:1,Decimal:3}],
    ]);

    this.GetData=function(upperSymbol)
    {
        var oneWord = upperSymbol.charAt(0);
        var twoWords = upperSymbol.substr(0,2);
        var oneWordName = null, twoWordsName=null;

        if (MARKET_SUFFIX_NAME.IsDCE(upperSymbol))  //大连商品交易所
        {
            oneWordName = MARKET_SUFFIX_NAME.DCE+'-'+oneWord;
            twoWordsName = MARKET_SUFFIX_NAME.DCE + '-' + twoWords;
        }
        else if (MARKET_SUFFIX_NAME.IsSHFE(upperSymbol))  //上期所
        {
            oneWordName = MARKET_SUFFIX_NAME.SHFE + '-' + oneWord;
            twoWordsName = MARKET_SUFFIX_NAME.SHFE + '-' + twoWords;
        }
        else if (MARKET_SUFFIX_NAME.IsCFFEX(upperSymbol))  //中期所 
        {
            oneWordName = MARKET_SUFFIX_NAME.CFFEX + '-' + oneWord;
            twoWordsName = MARKET_SUFFIX_NAME.CFFEX + '-' + twoWords;
        }
        else if (MARKET_SUFFIX_NAME.IsCZCE(upperSymbol))  //郑州期货交易所
        {
            oneWordName = MARKET_SUFFIX_NAME.CZCE + '-' + oneWord;
            twoWordsName = MARKET_SUFFIX_NAME.CZCE + '-' + twoWords;
        }

        if (MAP_TWOWORDS.has(twoWordsName))
        {
            return MAP_TWOWORDS.get(twoWordsName);
        }

        if (MAP_ONEWORD.has(oneWordName))
        {
            return MAP_ONEWORD.get(oneWordName);
        }

        return null;
    }

    this.GetSplitData = function (upperSymbol)
    {
        var data=this.GetData(upperSymbol);
        if (!data) return null;

        return TIME_SPLIT[data.Time];
    }

    this.GetDecimal=function(upperSymbol)
    {
        var data=this.GetData(upperSymbol);
        if (!data) return 2;

        return data.Decimal;
    }
}

var g_MinuteTimeStringData = new MinuteTimeStringData();
var g_MinuteCoordinateData = new MinuteCoordinateData();
var g_FuturesTimeData = new FuturesTimeData();


function GetfloatPrecision(symbol)  //获取小数位数
{
    var defaultfloatPrecision=2;    //默认2位
    if (!symbol) return defaultfloatPrecision;
    var upperSymbol=symbol.toUpperCase();

    if (MARKET_SUFFIX_NAME.IsSHSZFund(upperSymbol)) defaultfloatPrecision=3;    //基金3位小数
    else if (MARKET_SUFFIX_NAME.IsChinaFutures(upperSymbol)) defaultfloatPrecision=g_FuturesTimeData.GetDecimal(upperSymbol);  //期货小数位数读配置

    return defaultfloatPrecision;
}


