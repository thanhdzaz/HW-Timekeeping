import { DoubleRightOutlined } from '@ant-design/icons';
import { notification } from 'antd';
// import Notify from 'components/Notify';
import { LAUCH_OBJ, SHIFT_OBJ } from 'constant';
import { auth, firestore } from 'firebase';
import { getDocs, query, where } from 'firebase/firestore/lite';

// import ipRangeCheck from 'ip-range-check';
import moment from 'moment';
import 'moment/locale/vi';
import { memo, useEffect, useState } from 'react';
// import { ACTIVE } from './constant';
import './index.less';
// import localIpV4Address from 'local-ipv4-address';

const Attendance = (): JSX.Element =>
{
    const [time, setTime] = useState(moment());
    const [leaves, setLeaves] = useState<any>([]);
    // const [ips, setIps] = useState<any>([]);
    // const [myIp, setMyIp] = useState<any>();
    const [attendanceRecord, setAttendanceRecord] = useState<any>({});
    const user = auth?.currentUser;

    const getAllLeave = () =>
    {
        firestore.get('Leave').then(setLeaves);
    };

    // const getActiveIps = async () =>
    // {
    //     firestore
    //         .get('IpConfig')
    //         .then((data) => setIps(data.filter((d) => d.status === ACTIVE)));
    // };

    const convertMsToHourMinSecondFormat = (milisecond) =>
    {
        const convertToHour = milisecond / 1000 / 60 / 60;
        let hour = Math.floor(convertToHour);
        const convertToMinute = (convertToHour - hour) * 60;
        let minute = Math.floor(convertToMinute);
        let second = Math.ceil((convertToMinute - minute) * 60);

        if (second === 60)
        {
            second = 0;
            minute += 1;
            if (minute === 60)
            {
                minute = 0;
                hour += 1;
            }
        }

        if (hour <= 0)
        {
            hour = 0;
            minute = 0;
            second = 0;
        }
        if (minute < 0)
        {
            minute = 0;
            second = 0;
        }
        if (second < 0)
        {
            second = 0;
        }

        return `${hour < 10 ? `0${hour}` : hour}:${
            minute < 10 ? `0${minute}` : minute
        }:${second < 10 ? `0${second}` : second}`;
    };

    // const handleCheckValidIp = (ip) =>
    // {
    //     const isValid = ipRangeCheck(
    //         ip,
    //         ips.map((i) => i.name),
    //     );
    //     if (isValid)
    //     {
    //         return true;
    //     }
    //     Notify('error', '?????a ch??? m???ng c???a b???n kh??ng kh???p v???i c??ng ty');
    //     return false;
    // };

    const handleCheckin = (): boolean =>
    {
        const isLeave = leaves.find(
            (l) =>
                moment(l.startDate).isSameOrBefore(moment(), 'day') &&
          moment(l.endDate).isSameOrAfter(moment(), 'day'),
        );

        if (attendanceRecord.checkInTime)
        {
            notification.warning({
                message: `B???n ???? check in v??o l??c ${moment(
                    attendanceRecord.checkInTime,
                ).format('HH:mm:ss')}`,
                placement: 'topRight',
            });
            return false;
        }

        if (isLeave)
        {
            notification.warning({
                message: 'B???n kh??ng th??? checkin v?? ???? xin ngh???',
                placement: 'topRight',
            });
            return false;
        }

        const date = moment().format('YYYY-MM-DD');
        const checkInTime = moment().format('YYYY-MM-DD HH:mm:ss');
        firestore
            .add('Timekeeping', {
                userId: user?.uid,
                date,
                checkInTime,
                checkOutTime: '',
                salaryTime: '',
                soonTime: '',
                lateTime: '',
                noSalaryTime: '',
                timeRange: '',
            })
            .then((rs) =>
            {
                if (rs.id)
                {
                    notification.success({
                        message: 'Check in th??nh c??ng',
                        placement: 'topRight',
                    });
                    setTimeout(() =>
                    {
                        handleCheckAttendance();
                    }, 1000);
                }
            });
        return true;
    };

    const handleCheckout = (): boolean =>
    {
        if (!attendanceRecord.checkInTime)
        {
            notification.warning({
                message: 'Vui l??ng check in tr?????c',
                placement: 'topRight',
            });
            return false;
        }
        const startTime = moment(
            `${moment().format('YYYY-MM-DD')} ${SHIFT_OBJ.startTime}`,
        );
        const endTime = moment(
            `${moment().format('YYYY-MM-DD')} ${SHIFT_OBJ.endTime}`,
        );

        const checkInTime = moment(
            attendanceRecord.checkInTime,
            'YYYY-MM-DD HH:mm:ss',
        );
        const launchStartTime = moment(moment().format(`YYYY-MM-DD ${LAUCH_OBJ.startTime}`), 'YYYY-MM-DD HH:mm:ss');
        const launchEndTime = moment(moment().format(`YYYY-MM-DD ${LAUCH_OBJ.endTime}`), 'YYYY-MM-DD HH:mm:ss');
        const totalMsSecondOfLaunchTime = moment.duration(launchEndTime.diff(launchStartTime)).asMilliseconds();
        const checkOutTime = moment();
        const timeRange = `${checkInTime.format(
            'HH:mm:ss',
        )} - ${checkOutTime.format('HH:mm:ss')}`;
        let noSalaryMilisecond = 0;
        let soonMilisecond = 0;
        let lateMilisecond = 0;
        let salaryMilisecond = 0;
        let noSalaryTime = '00:00:00';
        let soonTime = '00:00:00';
        let lateTime = '00:00:00';
        let salaryTime = '00:00:00';

        // T??nh s??? milisecond kh??ng t??nh l????ng (?????n s???m h??n gi??? checkin ho???c mu???n h??n gi??? checkout)
        if (checkInTime.isBefore(startTime))
        {
            const milisecond = startTime.diff(checkInTime, 'milliseconds');
            noSalaryMilisecond += milisecond;
        }
        if (checkOutTime.isAfter(endTime))
        {
            const milisecond = checkOutTime.diff(endTime, 'milliseconds');
            noSalaryMilisecond += milisecond;
        }
        // Th???i gian kh??ng t??nh l????ng HH:mm:ss
        noSalaryTime = convertMsToHourMinSecondFormat(noSalaryMilisecond);

        // T??nh s??? milisecond checkin mu???n
        if (checkInTime.isAfter(startTime))
        {
            const milisecond = checkInTime.diff(startTime, 'milliseconds');
            lateMilisecond += milisecond;
        }

        // Th???i gian ??i mu???n HH:mm:ss
        lateTime = convertMsToHourMinSecondFormat(lateMilisecond);

        // T??nh s??? milisecond checkout s???m
        if (checkOutTime.isBefore(endTime))
        {
            const milisecond = endTime.diff(checkOutTime, 'milliseconds');
            soonMilisecond += milisecond;
        }

        soonTime = convertMsToHourMinSecondFormat(soonMilisecond);

        // N???u gi??? gian check in v?? check out n???m trong gi??? ngh??? tr??a
        if (checkInTime.isSameOrAfter(launchStartTime) && checkOutTime.isSameOrBefore(launchStartTime))
        {
            salaryMilisecond = 0;
        }

        // N???u th???i gian check in v?? check out n???m ngo??i gi??? ngh??? tr??a
        if (checkInTime.isBefore(launchStartTime) && checkOutTime.isAfter(launchStartTime))
        {
            salaryMilisecond = checkOutTime.diff(checkInTime, 'milliseconds') - noSalaryMilisecond - totalMsSecondOfLaunchTime;
        }

        // N???u th???i gian check in b?? h??n gi??? ngh??? tr??a v?? gi??? check out n???m trong gi??? ngh??? tr??a
        if (checkInTime.isBefore(launchStartTime) && checkOutTime.isSameOrAfter(launchStartTime) && checkOutTime.isSameOrBefore(launchStartTime))
        {
            salaryMilisecond = launchStartTime.diff(checkInTime, 'milliseconds') - noSalaryMilisecond;
        }

        // N???u th???i gian check in n???m trong gi??? ngh??? tr??a v?? gi??? check out l???n h??n gi??? k???t th??c ngh??? tr??a
        if (checkInTime.isBefore(launchStartTime) && checkOutTime.isSameOrAfter(launchStartTime) && checkOutTime.isSameOrBefore(launchStartTime))
        {
            salaryMilisecond = checkOutTime.diff(launchEndTime, 'milliseconds') - noSalaryMilisecond;
        }

        salaryTime = convertMsToHourMinSecondFormat(salaryMilisecond);

        firestore
            .update('Timekeeping', attendanceRecord.id, {
                checkOutTime: checkOutTime.format('YYYY-MM-DD HH:mm:ss'),
                salaryTime,
                soonTime,
                lateTime,
                noSalaryTime,
                timeRange,
            })
            .then(() =>
            {
                notification.success({
                    message: 'Check out th??nh c??ng',
                    placement: 'topRight',
                });
                handleCheckAttendance();
            });
        return true;
    };

    const handleCheckAttendance = async () =>
    {
        if (auth?.currentUser?.uid)
        {
            const q = query(
                firestore.collection('Timekeeping'),
                where('date', '==', moment().format('YYYY-MM-DD')),
                where('userId', '==', auth?.currentUser?.uid),
            );
            const res: any = [];
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) =>
            {
                res.push(doc.data());
            });
            if (res.length)
            {
                setAttendanceRecord(res[0]);
            }
        }
       
    };

    // check xem ???? check in ho???c check out ch??a
    useEffect(() =>
    {
        if (window.location.pathname.split('/').includes('attendance'))
        {
            handleCheckAttendance();
            getAllLeave(); // l???y t???t c??? ng??y xin ngh??? c???a c??? t??? ch???c
        }
    }, [window.location.pathname, auth?.currentUser?.uid]);

    // update real time clock
    useEffect(() =>
    {
        setInterval(() =>
        {
            setTime(moment());
        }, 1000);
    }, []);

    console.log(auth?.currentUser?.uid);

    return (
        <div className="attendances-container">
            {/* <div className="setting-btn">
                <Link to="/network-config">
                    <SettingTwoTone className="icon" />
                </Link>
            </div> */}
            <div className="header">
                <h1 className="title">Ch???m c??ng</h1>
                <div className="note">
          Nh??n vi??n l??u ??: Gi??? l??m vi???c c???a c??ng ty ch??ng ta l?? t???:{' '}
                    {SHIFT_OBJ.startTime} - {SHIFT_OBJ.endTime}. Mong m???i ng?????i ?????n ????ng
          gi???!
                </div>
                <div className="time">
                    {time.format('dddd').charAt(0).toUpperCase() +
            time
                .format('dddd [ng??y] DD [th??ng] MM [n??m] YYYY HH:mm:ss')
                .slice(1)}
                </div>
            </div>
            <div className="content">
                <div
                    className="attendance-btn check-in-btn"
                    onClick={handleCheckin}
                >
                    <DoubleRightOutlined />
                    <span className="text">Check-in</span>
                </div>
                <div
                    className="attendance-btn check-out-btn"
                    onClick={handleCheckout}
                >
                    <DoubleRightOutlined />
                    <span className="text">Check-out</span>
                </div>
            </div>
        </div>
    );
};
export default memo(Attendance);
