import React, {useState, useEffect, useMemo} from 'react'
import {Grid, Button} from '@material-ui/core'
import {makeStyles} from "@material-ui/core/styles"
import { Edit } from '@material-ui/icons'

import {useAsync} from '../../service/utils'
import {displayNumber} from '../../service/textService'
import {useSetting} from '../../provider/setting'
import {getCookie, setCookie} from '../../service/cookie'
import {getCoinByWalletId} from '../../api/coin'
import {useStyles} from '../style/material_ui_style'
import WalletInfo from './walletInfo'
import MarketInfo from './marketInfo'
import EditEarning from './editEarning'
import EarningsPerDay from './earningsPerDay'

const earningTimeTexts = [
  '15 min',
  '30 min',
  '1 hour',
  '12 hour',
  '24 hour',
  '1 week',
  '1 month',
]
const MiddleInfo = () => {
  const {data, status, error, run} = useAsync({
    status: 'idle',
  })
  const classes = useStyles();
  const [setting, dispatch] = useSetting()
  const [amounts, setAmounts] = useState([0, 0, 0, 0, 0, 0, 0])
  const [earnings, setEarnings] = useState([0, 0, 0, 0, 0, 0, 0])
  const [currentAmount, setCurrentAmount] = useState(0)
  const [currentValue, setCurrentValue] = useState(0)
  const refreshEarning = () => {
    if (setting.walletId != null && setting.walletId != '') {
      run(getCoinByWalletId(setting.walletId))
    }
  }

  useEffect(() => {
    // first display from cookie
    const curAmount = getCookie('currentAmount')
    const curValue = getCookie('currentValue')
    if (curAmount != '')
      setCurrentAmount(parseInt(curAmount))
    if (curValue != '')
      setCurrentValue(parseFloat(curValue))
    const tmpAmounts = getCookie('amounts')
    const tmpEarnings = getCookie('earnings')
    if (tmpAmounts != '') {
      setAmounts(JSON.parse(tmpAmounts))
      console.log(JSON.parse(tmpAmounts))
    }
    if (tmpEarnings != '')
      setEarnings(JSON.parse(tmpEarnings))
  }, [])
  useEffect(() => {
    if (setting.walletId != null && setting.walletId != '') {
      run(getCoinByWalletId(setting.walletId))
    }
    const interval = setInterval(function () {
      console.log('update coin')
      console.log(setting)
      if (setting.walletId != null && setting.walletId != '') {
        run(getCoinByWalletId(setting.walletId))
      }
    }, 30000)
    return () => {
      clearInterval(interval);
    }
  }, [setting, run])
  useEffect(() => {
    if (status === 'idle') {
      console.log('idle')
    } else if (status === 'pending') {
      console.log('pending')
    } else if (status === 'rejected') {
      console.log(error)
    } else if (status === 'resolved') {
      let tmpAmounts = [0, 0, 0, 0, 0, 0, 0]
      let tmpEarnings = [0, 0, 0, 0, 0, 0, 0]
      if (data != null && data.length != 0 && data[0] != -1) {
        data.forEach((item, index) => {
          if (index != 0) {
            if (item == -1) {
              if (index == 1) {
                tmpAmounts[index - 1] = 0
                tmpEarnings[index - 1] = 0
              }
              else {
                tmpAmounts[index - 1] = tmpAmounts[index - 2]
                tmpEarnings[index - 1] = tmpEarnings[index - 2]
              }
            }
            else {
              let tmp = data[0] - item
              tmpAmounts[index - 1] = tmp
              tmpEarnings[index - 1] = tmp * setting?.price
            }
          }
        })
        // set Wallet values
        setCurrentAmount(data[0])
        setCurrentValue(data[0] * setting?.price)
        setCookie('currentAmount', data[0], 10)
        setCookie('currentValue', data[0] * setting?.price, 10)
        //--set Wallet values
        setCookie('amounts', JSON.stringify(tmpAmounts), 10)
        setCookie('earnings', JSON.stringify(tmpEarnings), 10)
        setAmounts(tmpAmounts)
        setEarnings(tmpEarnings)
      }
    }
  }, [status])

  return (
    <>
      <div className="row">
        {/* chart */}
        <EarningsPerDay />
        {/* info */}
        <MarketInfo />
      </div>
      <div className="row">
        {/* earnings */}
        <div className="widget" id="earnings">
          <div className="widgettitle">
            <a><b>EARNINGS</b></a>
            <div className="titlesettings">
              30m
            </div>
            <div className="titlesettings">
              USD
            </div>
            <div className="titlesettings">
              <EditEarning refresh={refreshEarning} />
            </div>
          </div>
          <div className="widgetcontent">
            {
              earningTimeTexts.map((item, index) => (
                <div className="widgetelement" key={index}>
                  <div className="widgetcolumn column1">
                    <div className="earningsstatus">
                      { amounts[index] >= 0 ?
                        <img src="images/up.svg" id="up" /> :
                        <img src="images/down.svg" id="down" />
                      }
                    </div>
                    <span className="text1">
                      {item}
                    </span>
                  </div>
                  <div className="widgetcolumn column2">
                    <span>
                      {displayNumber(amounts[index])}
                    </span>
                  </div>
                  <div className="widgetcolumn column3">
                    <span className="text3">
                      {displayNumber(earnings[index])}$
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        {/* wallet (incomplete) */}
        <div className="widget" id="wallet">
          <div className="widgettitle">
            <a><b>WALLET</b></a>
            <div className="dropdown">
              <img src="images/dropdown.svg" />
            </div>
            <div className="titlesettings">
              <WalletInfo />
            </div>
          </div>
          <div className="widgetcontent">
            <div className="widgetelement">
              <div className="widgettext1">
                Total coins
              </div>
              <div className="widgettext2">
                {displayNumber(currentAmount)}
              </div>
            </div>
            <div className="widgetelement">
              <div className="widgettext1">
                Total values
              </div>
              <div className="widgettext2">
                $ {displayNumber(currentValue)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        {/* twitter */}
        <div className="widget" id="twitter">
          <div className="widgettitle">
            <a><b>TWITTER</b></a>
            <div className="dropdown">
              <img src="images/dropdown.svg" />
            </div>
          </div>
          <div className="widgetcontent">
            <div className="widgetcontent2">
                {/* twitter feed here */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MiddleInfo