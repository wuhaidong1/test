import React, { Component } from 'react';
import 'antd/dist/antd.css';
import { ConfigProvider, Tabs, Tree, Input, Button, Row, Col, Table, Tooltip, Modal, Spin, message, Icon, Drawer } from 'antd';
import Utils from '@/public/script/utils';
import Common from '@/public/script/common';
import DictTable from '@/lib/Components/DictTable';
import MyPageForm from './components/myPageForm';
import MyPageStore from './data/myPageStore';
import MyPageAction from './action/myPageAction';
import TrackDetail from './components/trackDetail';


const { TreeNode } = Tree;
const Search = Input.Search;
const tableName = 'myPageForm';

class MyPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myTreeData: [], //存放获取的整颗目录树
      showLine: true,
      autoExpandParent: true,//目录是否自动展开
      myTreeExpandedKeys: [],//（受控）展开指定的树节点
      mySelectedKeys: [],//选中的子目录树
      dataSource: [],//存放表单里的数据

      loading: true,
      myTable: {
        recordSet: [],
        startPage: 1,
        pageRow: 10,
        totalRow: 0,
      },

      selectedRowKeys: [],//多选框被选中的数据
      drawerVisible: false,
      recordId: '',//去到详情页用这个id查
      sysId:'',//系统的id.父树的id


    }
  }
  componentDidMount() {
    this.unsubscribe = MyPageStore.listen(this.onServiceComplete);
    MyPageAction.initTree();


  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  onServiceComplete = data => {
    // console.log(data)
    // console.log("我希望")

    if (data.errMsg == "") {
      if (data.operation == 'initTree') {
    console.log("我希望",data.recordSet[0].key)
      if(data.recordSet.length>0){
        this.setState({
          sysId: data.recordSet[0].key,
        },()=>{
          let filter = {
            page: 1,
            pageSize: 1000,
            filter: "",
            funcId: "",
            sysId: this.state.sysId,
          };
          MyPageAction.getTableDetail(filter);
        });
      }

        this.setState({
          myTreeData: data.recordSet,
        });
      }
      else if (data.operation == 'getTableDetail') {
        this.setState({
          loading: false,
          myTable: data,
          dataSource: data.recordSet,
        });
      }
    }
    else {
      message.warning(data.errMsg)
    }
  }


  // onMySelect 点击左侧树查询表单详情 右边列表刷新数据
  onMySelect = (mySelectedKeys, { node }) => {
    // console.log("我想看看", mySelectedKeys)
    // console.log("我想看看node", node.props)
    this.setState({
      loading: true,
    })
    let filter = {
      page: 1,
      pageSize: 1000,
      filter: "",
      funcId: "",
      sysId: "",
    };
    
    const nodes = node.props;
    // 区别点击的是子树还是父树
    if (nodes.children.length > 0 && nodes.dataRef.funcType == "1") {//系统类型
      filter.sysId = nodes.eventKey
      filter.funcId = ''
    }
    else if (nodes.funcType == "0") {
      this.state.myTreeData.forEach(val => {
        val.children.forEach(v => {
          if (v.key == nodes.eventKey) {
            filter.sysId = val.key
          }
        })
      })
      filter.funcId = nodes.eventKey
    }
    // console.log("我的filter", filter)
    MyPageAction.getTableDetail(filter);
  }
  // 处理目录树的子节点     这种写法是个啥？
  renderMyTreeNodes = (data) => {
    // console.log("神经病吗", data)
    // let data = Array.from(data);
    return data.map(item => {
      if (item.children && item.children.length) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderMyTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.title}  {...item} />;
    })
  }



  // 树是否自动扩展
  onMyTreeExpand = myTreeExpandedKeys => {
    this.setState({
      myTreeExpandedKeys,
      autoExpandParent: false,
    });
  }

  //第一排的复选择框
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  }

  //分页
  onTableRefresh = (current, pageRow) => {
    const { myTable } = this.state;
    let tempObj = Object.assign(myTable, { startPage: current, pageRow: pageRow });
    this.setState({ myTable: tempObj });
    // this.handleQueryClick();
  };
  //搜索框赋值
  // onChangeFilter = (searchText, e) => {
  //   const value = e.target.value;
  //   this.setState({
  //     searchText: value
  //   })
  // }


  // 搜索
  // onSearch = () => {
  //   this.setState({ loading: true });
  //   const { requirementsVersion, stateId, searchText } = this.state;
  //   RequirementsVersionActions.retrieveList({
  //     searchText: searchText.replace(/(^\s*)|(\s*$)/g, ""),
  //     release_status: stateId,
  //     startPage: '1',
  //     pageRow: requirementsVersion.pageRow
  //   }
  //   );
  // }
   //批量下载
  //  doDownload = (record) => {
  //   if(record.id){
  //     // console.log('单独下载')
  //     // console.log(record)
  //     var url = Utils.smUrl+'/filesZip/filesdownZip?ids=' + record.id
  //     var elink = document.createElement('a');
  //     elink.style.display = 'none';
  //     elink.href = url;
  //     document.body.appendChild(elink);
  //     elink.click();
  //     document.body.removeChild(elink);
  //   }else{
  //     if(this.state.ids.length>0){
  //       this.setState({
  //         downloading:true,
  //       })
  //       // console.log('勾选多个下载')
  //       // console.log(this.state.ids)
  //       var url = Utils.smUrl+'/filesZip/filesdownZip'
  //       this.state.ids.forEach((val,index)=>{
  //         if(index=="0"){
  //           url += '?ids=' + val
  //         }else{
  //           url += '&ids='+val
  //         }
  //       })
  //       var elink = document.createElement('a');
  //       elink.style.display = 'none';
  //       elink.href = url;
  //       document.body.appendChild(elink);
  //       elink.click();
  //       document.body.removeChild(elink);
  //       this.setState({
  //         downloading:false,
  //       })
  //     }else{
  //       message.warning('请至少勾选一条数据！')
  //     }
  //   }
  // }
  doDownload=(record)=>{
    // console.log("我111要下载record",record);
    var ids=[];
    ids=ids.push(record.id)
    var obj={uuid:record.id}
    MyPageAction.doDownload(obj);
    // var url = Utils.smUrl+'/filesZip/filesdownZip?ids=' + record.id

    var elink = document.createElement('a');
    elink.style.display = 'none';
    elink.href = url;
    document.body.appendChild(elink);
    elink.click();
    document.body.removeChild(elink);


  }

  render() {
    const { myTable, loading, myTreeData } = this.state;

    // 左上角按钮
    const leftButtons = <Search placeholder="请输入文档名称/类型/版本/更新者" onSearch allowClear onChange className='top-search-style' maxLength='30' />
    //右上角按钮
    const rightButtons = <Button type="primary" onClick>批量下载</Button>
    // 表格属性
    var attrs = {
      self: this,
      tableName: tableName,
      primaryKey: "id",
      buttons: leftButtons,
      btnPosition: "top",
      rightButtons: rightButtons,
      padding: "0",
      operCol: null,
      tableForm: MyPageForm,
      size: "middle",
      editCol: false,
      editTable: false,
      views: null,
      defView: "我的文档跟踪",
      totalPage: myTable.recordSet.total,
      currentPage: myTable.recordSet.startRow,
      onRefresh: this.onTableRefresh,//分页必备属性
    };

    const selectedRowKeys = this.state.selectedRowKeys;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    };
    return (<div className='' >

      {/* 左侧目录树部分 */}
      <div style={{ width: '300px', display: 'inline-block', borderRight: '1px solid rgba(0, 0, 0, 0.16)', height: '100%' }}>
        我的目录
      <Tree
          // 展开/收起节点时触发
          onExpand={this.onMyTreeExpand}
          showLine
          expandedKeys={this.state.myTreeExpandedKeys}
          autoExpandParent={this.state.autoExpandParent}
          className="hide-file-icon"
          onSelect={this.onMySelect}
          selectedKeys={this.state.mySelectedKeys}
          v-if="this.state.myTreeData.length"

        >
          {this.renderMyTreeNodes(myTreeData)}
        </Tree>
      </div>
      {/* 右侧table部分 */}

      <div style={{ width: 'calc(100% - 300px)', display: 'inline-block', verticalAlign: 'top', padding: '0 0 0 24px' }}>
        <div style={{ padding: '0 0 20px 0', borderBottom: '1px solid rgba(0, 0, 0, 0.16)' }}>
          <DictTable dataSource={myTable.recordSet.list} loading={loading} attrs={attrs} rowSelection={rowSelection} />
          {/* dataSource={myTable.recordSet} */}
        </div>
      </div>
      {/* 抽屉部分 */}
      <Drawer
        // title="Basic Drawer"
        placement="right"
        closable={false}
        onClose={this.onCloseDrawer}
        visible={this.state.drawerVisible}
        width={1000}
      >
        <TrackDetail fileUid={this.state.recordId} />
      </Drawer>
    </div>



    );
  }
  //开抽屉
  showDrawer = (record) => {
    console.log("大抽屉record",record)
    this.setState({
      drawerVisible: true,
      recordId: record.id,

    });
  };
  //关抽屉
  onCloseDrawer = () => {
    this.setState({
      drawerVisible: false,
      recordId: "",
    });
  }



}
export default MyPage;
