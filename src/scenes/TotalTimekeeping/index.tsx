/* eslint-disable indent */
import { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { DatePicker } from 'antd';
import Text from 'antd/lib/typography/Text';
import { firestore } from 'firebase';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { listUserInfoAtom } from 'stores/atom/user';
import Day from './Day';
import Month from './Month';
import Week from './Week';

const TotalTimeKeeping = (): JSX.Element =>
{
  const [viewMode, setViewMode] = useState('day');
  const [dataTimekeeping, setDataTimekeeping] = useState([]);
  const [dateRange, setDateRange] = useState<any>([moment(), moment()]);
  const [monthDateRange, setMonthDateRange] = useState<any>([moment().startOf('month'), moment().endOf('month')]);
  const [dataUsers, setDataUsers] = useState<any>([]);
  const [date, setDate] = useState(moment());
  const listUser = useRecoilValue(listUserInfoAtom);
  const [keyword, setKeyword] = useState('');

  console.log(listUser);

  const getTimeKeeping = async () =>
{
    const rs = await firestore.get('Timekeeping');
    console.log('rs: ', rs);
    
    let timekeepings;
    if (viewMode === 'day')
{
      timekeepings = rs.filter((t) => moment(t.date).isSame(date, 'day'));
    }
    if (viewMode === 'week')
{
      timekeepings = rs.filter(
        (t) =>
          moment(t.date).isSameOrAfter(dateRange[0], 'day') &&
          moment(t.date).isSameOrBefore(dateRange[1], 'day'),
      );
    }
    if (viewMode === 'month')
{
      timekeepings = rs.filter(
        (t) =>
          moment(t.date).isSameOrAfter(monthDateRange[0], 'day') &&
          moment(t.date).isSameOrBefore(monthDateRange[1], 'day'),
      );
    }
    console.log(timekeepings);
    setDataTimekeeping(timekeepings);
  };

  const getUsers = async () =>
{
    const us = listUser.filter(us => us.fullName?.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()));
    setDataUsers(us);
  };

  const handleSelectDateRange = (arrMoment) =>
{
    const startDate = arrMoment[0];
    const endDate = arrMoment[1];
    setDateRange([startDate, endDate]);
  };

  const handleSelectDate = (dateMoment) =>
{
    setDate(dateMoment);
  };

  const handleSelectMonth = (_moment) =>
{
  // v?? moment tr?????c l?? startOf, v?? ch??a clone n??n khi moment.endOf th?? th???ng startOf c??ng th??nh endOf
  // Ch??nh v?? th??? n??n ch??ng ta c???n clone();
    setMonthDateRange([_moment.clone().startOf('month'), _moment.clone().endOf('month')]);
  };
  useEffect(() =>
{
    getTimeKeeping();
  }, [date, dateRange, monthDateRange, viewMode]);

  useEffect(() =>
{
    getUsers();
  }, [listUser, keyword]);

  return (
    <div className="total-time-keeping-container">
      <div className="header">
        <span />
        <div className="header-filter">
         {viewMode !== 'month' && (
          <div className="header-filter-item">
                <Text>T??m ki???m:</Text>
                <ProFormText
                    width="md"
                    name="search"
                    label=""
                    placeholder="Nh???p t??? kh??a"
                    fieldProps={{
                    onChange: (e) => setKeyword(e.target.value),
                  }}
                />
          </div>
          )}
          <div className="header-filter-item">
            <Text>Ch??? ????? xem:</Text>
            <ProFormSelect
                name="viewMode"
                label=""
                fieldProps={{
                value: viewMode,
                onChange: setViewMode,
              }}
                width="sm"
                options={[
                { value: 'day', label: 'Theo ng??y' },
                { value: 'week', label: 'Theo kho???ng th???i gian' },
                { value: 'month', label: 'Theo th??ng' },
              ]}
            />
          </div>
          <div className="header-filter-item">
            <Text>Ch???n th???i gian:</Text>
            <div>
              {viewMode === 'day' && (
                <DatePicker
                    name="date"
                    format="DD-MM-YYYY"
                    value={date}
                    placeholder="Ch???n ng??y"
                    allowClear={false}
                    onChange={handleSelectDate}
                />
              )}
              {viewMode === 'week' && (
                <DatePicker.RangePicker
                    format="DD-MM-YYYY"
                    value={dateRange}
                    name="dateRange"
                    allowClear={false}
                    onChange={handleSelectDateRange}
                />
              )}
              {viewMode === 'month' && (
                <DatePicker.MonthPicker
                    name="month"
                    format="MM-YYYY"
                    value={monthDateRange[0]}
                    allowClear={false}
                    placeholder="Ch???n th??ng"
                    onChange={handleSelectMonth}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* <ProForm onFinish={handleAttendance}>
        <ProFormDateTimePicker
            label="Gi??? check-in"
            name="checkInTime"
        />
        <ProFormDateTimePicker
            label="Gi??? check-out"
            name="checkOutTime"
        />
      </ProForm> */}
      {viewMode === 'day' && (
        <Day
            dataUsers={dataUsers}
            dataTimekeeping={dataTimekeeping}
            date={date}
        />
      )}
      {viewMode === 'week' && (
        <Week
            dataUsers={dataUsers}
            dataTimekeeping={dataTimekeeping}
            dateRange={dateRange}
        />
      )}

      {viewMode === 'month' && (
        <Month
            dataUsers={dataUsers}
            dataTimekeeping={dataTimekeeping}
        />
      )}
    </div>
  );
};

export default TotalTimeKeeping;
