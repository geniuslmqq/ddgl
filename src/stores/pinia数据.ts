import { defineStore } from "pinia";
import { socket } from "./socket链接";


export const pinia数据中心 = defineStore("pinia数据中心", {
  state: () => {
    return {
      当前数据库状态: "未连接",
      当前登录用户: "",
      密码: "",

      //新订单的默认数据
      新订单模板: {
        类型: "新订单",
        删除信息: "",
        订单号: "",
        年: "",
        月: "",
        日: "",
        镜片下单日: "",
        旺旺名: "",
        收件人: "",
        镜片: "",

        右近视: "",
        右散光: "",
        右轴向: "",
        左近视: "",
        左散光: "",
        左轴向: "",
        瞳距: "",

        备注: "",

      },
      新镜片模板: {
        镜片名  : null,
        品牌名  : null,
        系列名  : null,
        折射率  : null,
        染色变色   : null,
        高散车房   : null,

        最高近视光度: null,
        最高散光光度: null,
        最高联合光度: null,
        最高远视光度: null,
        最高远视散光: null,
        供应商  : null,
        售价   : null,
        进货价  : null,
        湖北和益 : null,
        湖北蔡司 : null,
        上海老周 : null,
        丹阳臻视 : null,
      },
      //首行用的 搜索值与属性
      旧订单搜索属性与值: [
        { 属性: '订单号', 值: '' },
        { 属性: '年', 值: '' },
        { 属性: '月', 值: '' },
        { 属性: '日', 值: '' },
        { 属性: '镜片下单日', 值: '' },
        { 属性: '旺旺名', 值: '' },
        { 属性: '收件人', 值: '' },
        { 属性: '镜片', 值: '' },


        { 属性: '右近视', 值: '' },
        { 属性: '右散光', 值: '' },
        { 属性: '右轴向', 值: '' },
        { 属性: '左近视', 值: '' },
        { 属性: '左散光', 值: '' },
        { 属性: '左轴向', 值: '' },
        { 属性: '瞳距', 值: '' },

        { 属性: '备注', 值: '' },

      ],

  
      要显示的首行: [],
      用户: [],
      旧订单: [] as any[],
      镜片数据: [] as any[],
      未完成订单: [],
      要全局搜索的值: "",
      排序的属性: "订单号",
      排序的顺逆: 1,

      菜单页面路径: window.location.pathname,
      菜单页面名: window.location.pathname,


      
      通过筛选的数量: 0,
      旧订单页数: 1,
      旧订单当前页: 1,
      旧订单每页显示的数量: 150,
      新订单页数: 1,
      新订单当前页: 1,
      新订单每页显示的数量: 150,
      添加订单窗口开关: false,
      日期: '',


    }
  },

  //计算属性
  getters: {
    镜片品牌列表:(state)=>{
      let 品牌列表 = []as any[]
      state.镜片数据.forEach((镜片)=>{
        if(品牌列表.indexOf(镜片.品牌名) == -1){
          品牌列表.push(镜片.品牌名)
        }
      })
      return 品牌列表
    },
    新镜片属性:(state)=>Object.keys(state.新镜片模板),
    //通过旧订单的首行来计算 首行的属性数组
    旧订单的所有属性: (state) => {
      let 属性
      let 订单的所有属性 = []
      for (属性 in state.旧订单[0]) {
        订单的所有属性.push(属性)
      }
      return 订单的所有属性;
    },
    //日期
    新订单初始化: (state) => {
      let date = new Date();
      state.新订单模板.年 = date.getFullYear().toString().slice(2)
      state.新订单模板.月 = ("0" + (date.getMonth() + 1)).slice(-2)
      state.新订单模板.日 = ("0" + date.getDate()).slice(-2)
      state.日期 = state.新订单模板.年 + "年" + state.新订单模板.月 + "月" + state.新订单模板.日 + "日"
      let 订单号 = date.getFullYear().toString().slice(-2) + ("0" + (date.getMonth() + 2)).slice(-2) + ("0" + date.getDate()).slice(-2)
      let 今日订单数量: any = state.旧订单.filter((行: any) => {
        return String(行.订单号).indexOf(订单号) >= 0
      })
      订单号 = 订单号 + ("0" + (今日订单数量.length + 1)).slice(-2)
      state.新订单模板.订单号 = 订单号
      return 订单号;
    },

    //计算属性
    获取用户数据: (state) => {
      socket.emit('所有用户数据', (返回数据: any) => {
        console.log(返回数据)
        state.用户 = 返回数据
      });
    },



    //要显示 删除的订单的模块
    已删除的订单: (state) => {
      return state.旧订单.filter((行: any) => {
        return 行.删除信息 !== '' && 行.删除信息.indexOf('彻底删除') == -1
      })
    },


    //要显示的订单的新模块
    筛选过的旧订单: (state) => {
      let 要显示的订单 = state.旧订单;
      let 要搜索的值 = state.旧订单搜索属性与值;
      let 序号: any
      //过滤掉删除的订单
      要显示的订单 = 要显示的订单.filter((行: any) => {
        return 行.删除信息 == ''
      })

      //搜素模块 
      //全局搜索
      if (state.要全局搜索的值) {
        要显示的订单 = state.旧订单.filter((行: any) => {       //过滤出要显示的订单           
          return Object.keys(行).some((key) => {   // key是行的每个属性名，some是检查行的属性是否有搜索的值
            return String(行[key]).indexOf(state.要全局搜索的值) > -1
          })
        })
      }
      //分组搜索
      for (序号 in 要搜索的值) {
        if (要搜索的值[序号].值) {
          console.log("在" + 要搜索的值[序号].属性 + "中搜索" + 要搜索的值[序号].值)
          要显示的订单 = 要显示的订单.filter((行: any) => {
            return String(行[要搜索的值[序号].属性]).indexOf(要搜索的值[序号].值) >= 0
          })
        }
      }
      state.通过筛选的数量 = 要显示的订单.length


      //排序模块 根据排序的属性来排序
      要显示的订单 = 要显示的订单.sort((前一个值: any, 后一个值: any) => {
        前一个值 = 前一个值[state.排序的属性]
        后一个值 = 后一个值[state.排序的属性]
        return (前一个值 >= 后一个值 ? 1 : -1) * state.排序的顺逆  // 正反为-1时，升序，正反为1时，降序
      })

      //分页模块
      state.旧订单页数 = Math.ceil(要显示的订单.length / state.旧订单每页显示的数量)

      要显示的订单 = 要显示的订单.slice((state.旧订单当前页 - 1) * state.旧订单每页显示的数量, state.旧订单当前页 * state.旧订单每页显示的数量)

      return 要显示的订单
    },

  



  },


  //函数 同步和异步函数
  actions: {
    //同步异步函数
    获取用户() {
      socket.emit('所有用户数据', (返回数据: any) => {
        this.用户 = 返回数据
        this.当前数据库状态 = "已连接"
      });
    },

    获取旧订单() {
      socket.emit('旧订单数据', (返回数据: any) => {
        this.旧订单 = 返回数据;
        this.当前数据库状态 = "已连接"
      })
    },
    获取镜片() {
      socket.emit('镜片数据', (返回数据: any) => {
        this.镜片数据 = 返回数据;
        this.当前数据库状态 = "已连接"
      })
    },



  },
});


