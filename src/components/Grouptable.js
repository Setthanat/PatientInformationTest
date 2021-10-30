import * as React from 'react'
import MaterialTable from 'material-table'
import axios from 'axios'
import Button from '@material-ui/core/Button'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { Divider } from '@material-ui/core';
import './Drawer.css'
import * as dayjs from 'dayjs'
import addDays from 'date-fns/addDays'
import BlockUi from 'react-block-ui'
import 'react-block-ui/style.css';

export default class Patient extends React.Component{
  constructor(props){
    super(props)
    this.toggleBlocking = this.toggleBlocking.bind(this)
    this.state = {
      data : [],
      time: "07:30",
      selectionRange: {
        startDate: new Date(),
        endDate: addDays(new Date(), 7),
        key: "selection"
      },
      seconddata: [],
      blocking: true
    }
  }

  componentDidMount(){
    axios.get('http://localhost:3030/book')
    .then(res =>{
      var datalength = res.data.length
      var arraydata = []
      for(var i=0;i<datalength;i++){
        var date = (res.data[i].registerdate)
        date = date.split(' ')
        var getdate = dayjs(date[0]).format('DD-MM-YYYY HH:mm')
        arraydata[i] = {
          '_id': res.data[i]._id, 
           'age': res.data[i].age, 
           'name': res.data[i].name, 
           'condition': res.data[i].condition, 
           'address': res.data[i].address,
           'gender': res.data[i].gender , 
           'phone': res.data[i].phone, 
           'state': res.data[i].state, 
           'registerdate': getdate
        }
      }
      this.setState({data: arraydata})
    })
    .catch(function (error) {
      console.log(error);
    })
    setTimeout(()=>{
      this.setState({blocking: !this.state.blocking})
    },3000)
  }

  toggleBlocking(){
      this.setState({blocking: !this.state.blocking})
  }

  selectTime = (value) =>{
    const time = value.target.value
    this.setState({time: this.state.time = time})
  }

  searchName = (value) =>{
    this.setState({blocking: !this.state.blocking})
    var nameCheck = value.target.textContent
    this.setState({seconddata: this.state.data})
    var allData = this.state.data
    var data = []
    allData.forEach(res => {
      if(nameCheck === res.name){
        data.push(res)
        this.setState({data})
        setTimeout(()=>{
          this.setState({blocking: !this.state.blocking})
        },1000)
      }
    });
    if(value.target.textContent === ''|| null){
      this.setState({data: this.state.seconddata})
      setTimeout(()=>{
        this.setState({blocking: !this.state.blocking})
      },3000)
    }
    this.setState({blocking: !this.state.blocking})
  }

  submitFilter =()=>{
    var startDate = dayjs(this.state.selectionRange.startDate).format('DD-MM-YYYY')
    var endDate = dayjs(this.state.selectionRange.endDate).format('DD-MM-YYYY')
    var timeSet = this.state.time
    axios.get('http://localhost:3030/book')
      .then( (res) =>{
        const alldata = res.data
        const getData = alldata.filter(function (a){
          var dateFormatted = a.registerdate
          dateFormatted = dateFormatted.split(' ')
          var timeFormat = dateFormatted[0].split('T')
          var timeFormatted = timeFormat[1]
          var hitDate = dayjs(dateFormatted[0]).format('DD-MM-YYYY')
          hitDate = hitDate.split('-')
          var sDate = startDate.split('-')
          var eDate = endDate.split('-')
          timeFormatted = timeFormatted.split(':')
          var tSet = timeSet.split(':')
          if(hitDate[2] >= sDate[2]&& hitDate[2] <= eDate[2]){
            if(hitDate[1] >= sDate[1]&& hitDate[1] <= eDate[1]){
              if(hitDate[0] >= sDate[0]&& hitDate[0] <= eDate[0]){
                if(tSet[0] === timeFormatted[0]&& tSet[1] === timeFormatted[1]){
                  var hitDateMatch = ''
                  return hitDateMatch.concat(hitDate[0],hitDate[1],hitDate[2])
                }
              }
            }
          }
        })
        var datalength = getData.length
        var arraydata = []
        for(var i=0;i<datalength;i++){
          var date = (getData[i].registerdate)
          date = date.split(' ')
          var getdate = dayjs(date[0]).format('DD-MM-YYYY HH:mm')
          arraydata[i] = {
            '_id': getData[i]._id, 
             'age': getData[i].age, 
             'name': getData[i].name, 
             'condition': getData[i].condition, 
             'address': getData[i].address,
             'gender': getData[i].gender , 
             'phone': getData[i].phone, 
             'state': getData[i].state, 
             'registerdate': getdate
          }
        }
        this.setState({data: arraydata})
      })
  }
  

  render(){
    return(
      <div>
      <BlockUi tag="div" blocking={this.state.blocking}>
          <h1 style={{textAlign:'left',paddingLeft:'15px',color:'ButtonShadow'}}>Patient Information</h1>
        <Autocomplete
                  id="combo-box-demo"
                  options={this.state.data}
                  onChange={this.searchName}
                  getOptionLabel={(option) => option.name}
                  style={{ width: '300px', padding:'10px'}}
                  renderInput={(params) => <TextField {...params} label="Search Name" variant="outlined" />}
                />
                
      <div style={{display:'flex'}}>
      <MaterialTable
        style={{width: `calc(100% - 352px)`}}
        title=""
        columns={[
          { title: 'Name', field: 'name', grouping: false },
          { title: 'Age', field: 'age' ,cellStyle:{width: '5%'}},
          { title: 'Gender', field: 'gender',cellStyle:{width: '5%'}} ,
          { title: 'Phone', field: 'phone'},
          { title: 'Address', field: 'address',cellStyle:{width: '30%'}},
          { title: 'Register date', field: 'registerdate' },
          { title: 'Condition', field: 'condition' },
          { title: 'State', field: 'state' , 
          lookup: {1: 'Common diseases', 2: 'Serious disease'}},
        ]}
        data={this.state.data}        
        // localization={{
        //   pagination:{
        //     labelRowsPerPage: {labelRowsPerPage}
        //   }
        // }
        // }
        options={{
          pageSize: 10,
          rowStyle: {
            height: '60px',
            backgroundColor: '#EEE',
          },
          grouping: true,
          search: false,
          headerStyle: {
            backgroundColor: '#01579b',
            color: '#FFF'
          }
        }}
      />
            <div style={{display:'flex', flexDirection:'column'}}>
                <DateRange
                    editableDateInputs={true}
                    onChange={(item) => this.setState({selectionRange: item.selection})}
                    moveRangeOnFirstSelection={false}
                    ranges={[this.state.selectionRange]}
                />
                <Divider />
                <form className="drawer-container" noValidate>
                <TextField
                    id="time"
                    label="Select Time"
                    type="time"
                    defaultValue={this.state.time}
                    className="drawer-textField"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{
                        step: 300, // 5 min
                    }}
                    onChange={this.selectTime}
                />
                </form>
                <Divider />
                <div style={{padding: '10px'}}>
                  <Button style={{backgroundColor:'#3d91ff',color:'white'}} onClick={this.submitFilter}>
                    Filter
                  </Button>
                </div>
                </div>
      </div>
        </BlockUi>
      </div>
    )
  }
}


