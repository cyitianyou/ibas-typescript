@echo off
setlocal EnableDelayedExpansion
echo ***************************************************************************
echo      compile_and_package.bat
echo                     by niuren.zhu
echo                           2016.06.19
echo  ˵����
echo     1. ��װapache-maven�����ص�ַhttp://maven.apache.org/download.cgi��
echo     2. ��ѹapache-maven��������ϵͳ����MAVEN_HOMEΪ��ѹ�ĳ���Ŀ¼��
echo     3. ����PATH������%%MAVEN_HOME%%\bin�������JAVA_HOME�����Ƿ���ȷ��
echo     4. ������ʾ������mvn -v ��鰲װ�Ƿ�ɹ���
echo     5. �˽ű�ʹ�õ�ǰĿ¼pom.xml������Ŀ��
echo ****************************************************************************
REM ���ò�������
SET WORK_FOLDER=%~dp0
SET h=%time:~0,2%
SET hh=%h: =0%
SET OPNAME=%date:~0,4%%date:~5,2%%date:~8,2%_%hh%%time:~3,2%%time:~6,2%
SET LOGFILE=%WORK_FOLDER%compile_and_package_log_%OPNAME%.txt

echo --��ǰ������Ŀ¼��[%WORK_FOLDER%]

if not exist %WORK_FOLDER%release md %WORK_FOLDER%release
if exist %WORK_FOLDER%release\*.* del /f /s /q %WORK_FOLDER%release\*.*
call "%MAVEN_HOME%\bin\mvn" clean package >>%LOGFILE%

if exist %WORK_FOLDER%\target\*.war copy /y %WORK_FOLDER%\target\*.war %WORK_FOLDER%release >>%LOGFILE%
if exist %WORK_FOLDER%\target\ rd /s /q %WORK_FOLDER%\target\ >>%LOGFILE%

echo --������ɣ�������Ϣ��鿴[compile_and_package_log_%OPNAME%.txt]